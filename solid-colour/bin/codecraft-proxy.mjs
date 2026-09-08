#!/usr/bin/env node
/**
 * Anthropic -> OpenAI translation proxy for the CodeCraft API.
 *
 * CodeCraft advertises an "Anthropic-compatible surface" for Claude Code, but only implements
 * the OpenAI surface: POST /v1/messages returns 404, POST /v1/chat/completions works. Claude Code
 * speaks the Anthropic protocol exclusively, so this proxy sits between them — it accepts
 * /v1/messages, rewrites the request into an OpenAI chat completion, and converts the reply
 * (including the streaming event sequence and tool calls) back into Anthropic's shape.
 *
 *   node bin/codecraft-proxy.mjs            # listens on 127.0.0.1:8787
 *   PORT=9000 node bin/codecraft-proxy.mjs
 *
 * Reads CODECRAFT_API_KEY and CODECRAFT_BASE_URL from the environment; bin/claude-cc starts it.
 * Binds to loopback only, so the key never leaves this machine.
 */
import { createServer } from 'node:http';
import { appendFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.PORT ?? 8787);
const UPSTREAM = (process.env.CODECRAFT_BASE_URL ?? 'https://codecraftapi.com/v1').replace(/\/$/, '');
const KEY = process.env.CODECRAFT_API_KEY;
const DEBUG = process.env.CODECRAFT_PROXY_DEBUG === '1';

if (!KEY) {
  console.error('[proxy] CODECRAFT_API_KEY is not set');
  process.exit(1);
}

const log = (...a) => DEBUG && console.error('[proxy]', ...a);

/* ------------------------------------------------------------------ request: Anthropic -> OpenAI */

/** Anthropic sends `system` as a string or a list of text blocks; OpenAI wants one system message. */
function systemText(system) {
  if (!system) return null;
  if (typeof system === 'string') return system;
  if (Array.isArray(system)) return system.map((b) => (typeof b === 'string' ? b : (b?.text ?? ''))).join('\n');
  return null;
}

/** An Anthropic image block carries base64 inline; OpenAI takes the same bytes as a data: URL. */
function imagePart(block) {
  const src = block.source ?? {};
  if (src.type === 'base64') return { type: 'image_url', image_url: { url: `data:${src.media_type};base64,${src.data}` } };
  if (src.type === 'url') return { type: 'image_url', image_url: { url: src.url } };
  return null;
}

/**
 * Flattens Anthropic messages into the OpenAI list. The shapes diverge most around tools:
 * Anthropic puts tool calls inside an assistant message's content and tool results inside the
 * *next user* message, while OpenAI uses a dedicated `tool_calls` field and separate `tool` rows.
 */
function toOpenAiMessages(anthropicMessages, system) {
  const out = [];
  const sys = systemText(system);
  if (sys) out.push({ role: 'system', content: sys });

  for (const msg of anthropicMessages ?? []) {
    const blocks = typeof msg.content === 'string' ? [{ type: 'text', text: msg.content }] : (msg.content ?? []);

    if (msg.role === 'user') {
      // tool_result blocks must become their own `tool` messages, ordered before the remaining text.
      const results = blocks.filter((b) => b?.type === 'tool_result');
      const rest = blocks.filter((b) => b?.type !== 'tool_result');
      for (const r of results) {
        const content =
          typeof r.content === 'string'
            ? r.content
            : Array.isArray(r.content)
              ? r.content.map((c) => (c?.type === 'text' ? c.text : JSON.stringify(c))).join('\n')
              : JSON.stringify(r.content ?? '');
        out.push({ role: 'tool', tool_call_id: r.tool_use_id, content: content || '(no output)' });
      }
      if (rest.length) {
        const parts = [];
        for (const b of rest) {
          if (b?.type === 'text') parts.push({ type: 'text', text: b.text });
          else if (b?.type === 'image') {
            const p = imagePart(b);
            if (p) parts.push(p);
          }
        }
        if (parts.length === 1 && parts[0].type === 'text') out.push({ role: 'user', content: parts[0].text });
        else if (parts.length) out.push({ role: 'user', content: parts });
      }
      continue;
    }

    if (msg.role === 'assistant') {
      const text = blocks.filter((b) => b?.type === 'text').map((b) => b.text).join('');
      const calls = blocks
        .filter((b) => b?.type === 'tool_use')
        .map((b) => ({ id: b.id, type: 'function', function: { name: b.name, arguments: JSON.stringify(b.input ?? {}) } }));
      const entry = { role: 'assistant', content: text || null };
      if (calls.length) entry.tool_calls = calls;
      out.push(entry);
    }
  }
  return out;
}

function toOpenAiTools(tools) {
  if (!Array.isArray(tools) || tools.length === 0) return undefined;
  return tools
    .filter((t) => t?.name)
    .map((t) => ({
      type: 'function',
      function: { name: t.name, description: t.description ?? '', parameters: t.input_schema ?? { type: 'object', properties: {} } },
    }));
}

function toOpenAiToolChoice(choice) {
  if (!choice) return undefined;
  if (choice.type === 'auto') return 'auto';
  if (choice.type === 'any') return 'required';
  if (choice.type === 'none') return 'none';
  if (choice.type === 'tool' && choice.name) return { type: 'function', function: { name: choice.name } };
  return undefined;
}

function buildUpstreamBody(body) {
  const req = {
    model: body.model,
    messages: toOpenAiMessages(body.messages, body.system),
    max_tokens: body.max_tokens ?? 4096,
    stream: Boolean(body.stream),
  };
  if (typeof body.temperature === 'number') req.temperature = body.temperature;
  if (typeof body.top_p === 'number') req.top_p = body.top_p;
  if (Array.isArray(body.stop_sequences) && body.stop_sequences.length) req.stop = body.stop_sequences;
  const tools = toOpenAiTools(body.tools);
  if (tools) req.tools = tools;
  const tc = toOpenAiToolChoice(body.tool_choice);
  if (tc) req.tool_choice = tc;
  if (req.stream) req.stream_options = { include_usage: true };
  return req;
}

/* ----------------------------------------------------------------- response: OpenAI -> Anthropic */

const STOP_REASON = { stop: 'end_turn', length: 'max_tokens', tool_calls: 'tool_use', function_call: 'tool_use', content_filter: 'end_turn' };
const stopReason = (r) => STOP_REASON[r] ?? (r ? 'end_turn' : null);

function toAnthropicResponse(oa, model) {
  const choice = oa.choices?.[0] ?? {};
  const msg = choice.message ?? {};
  const content = [];
  if (msg.content) content.push({ type: 'text', text: msg.content });
  for (const call of msg.tool_calls ?? []) {
    let input = {};
    try {
      input = JSON.parse(call.function?.arguments || '{}');
    } catch {
      input = { _raw: call.function?.arguments ?? '' };
    }
    content.push({ type: 'tool_use', id: call.id || `toolu_${randomUUID().replace(/-/g, '').slice(0, 24)}`, name: call.function?.name, input });
  }
  if (content.length === 0) content.push({ type: 'text', text: '' });
  return {
    id: oa.id || `msg_${randomUUID().replace(/-/g, '').slice(0, 24)}`,
    type: 'message',
    role: 'assistant',
    model: oa.model || model,
    content,
    stop_reason: stopReason(choice.finish_reason) ?? 'end_turn',
    stop_sequence: null,
    usage: {
      input_tokens: oa.usage?.prompt_tokens ?? 0,
      output_tokens: oa.usage?.completion_tokens ?? 0,
    },
  };
}

const DUMP = process.env.CODECRAFT_PROXY_DUMP;
const sse = (res, event, data) => {
  if (DUMP) {
    try {
      appendFileSync(DUMP, `${event} ${JSON.stringify(data).slice(0, 300)}\n`);
    } catch { /* dump is best-effort */ }
  }
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
};

/**
 * Rewrites an OpenAI delta stream as Anthropic's event sequence.
 *
 * Anthropic frames every piece of content as an indexed block with explicit start/stop events,
 * whereas OpenAI emits loose deltas; tool arguments in particular arrive as JSON fragments that
 * must be republished as `input_json_delta`. Blocks are opened lazily as content first appears.
 */
async function pipeStream(upstream, res, model) {
  const messageId = `msg_${randomUUID().replace(/-/g, '').slice(0, 24)}`;
  res.writeHead(200, {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache, no-transform',
    connection: 'keep-alive',
    'x-accel-buffering': 'no',
  });

  sse(res, 'message_start', {
    type: 'message_start',
    message: { id: messageId, type: 'message', role: 'assistant', model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 0, output_tokens: 0 } },
  });

  let nextIndex = 0;
  let textIndex = null; // index of the open text block, if any
  const toolBlocks = new Map(); // OpenAI tool_call index -> { index, started }
  let finish = null;
  let usage = { input_tokens: 0, output_tokens: 0 };

  // A keep-alive ping keeps intermediaries from dropping a long, quiet tool call.
  const ping = setInterval(() => sse(res, 'ping', { type: 'ping' }), 15_000);

  const closeText = () => {
    if (textIndex !== null) {
      sse(res, 'content_block_stop', { type: 'content_block_stop', index: textIndex });
      textIndex = null;
    }
  };

  let buffer = '';
  // fetch yields Uint8Array chunks; decode with a streaming decoder so a multi-byte character
  // split across two chunks is not mangled (Uint8Array.toString() would emit byte numbers).
  const decoder = new TextDecoder('utf-8');
  try {
    for await (const chunk of upstream.body) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') continue;

        let evt;
        try {
          evt = JSON.parse(payload);
        } catch {
          continue;
        }
        if (evt.usage) {
          usage = { input_tokens: evt.usage.prompt_tokens ?? usage.input_tokens, output_tokens: evt.usage.completion_tokens ?? usage.output_tokens };
        }
        const choice = evt.choices?.[0];
        if (!choice) continue;
        if (choice.finish_reason) finish = choice.finish_reason;
        const delta = choice.delta ?? {};

        if (delta.content) {
          if (textIndex === null) {
            textIndex = nextIndex++;
            sse(res, 'content_block_start', { type: 'content_block_start', index: textIndex, content_block: { type: 'text', text: '' } });
          }
          sse(res, 'content_block_delta', { type: 'content_block_delta', index: textIndex, delta: { type: 'text_delta', text: delta.content } });
        }

        for (const call of delta.tool_calls ?? []) {
          const key = call.index ?? 0;
          let block = toolBlocks.get(key);
          if (!block) {
            closeText(); // Anthropic requires the text block to end before a tool block opens
            block = { index: nextIndex++ };
            toolBlocks.set(key, block);
            sse(res, 'content_block_start', {
              type: 'content_block_start',
              index: block.index,
              content_block: { type: 'tool_use', id: call.id || `toolu_${randomUUID().replace(/-/g, '').slice(0, 24)}`, name: call.function?.name ?? '', input: {} },
            });
          }
          const args = call.function?.arguments;
          if (args) sse(res, 'content_block_delta', { type: 'content_block_delta', index: block.index, delta: { type: 'input_json_delta', partial_json: args } });
        }
      }
    }
  } catch (err) {
    log('stream error', err?.message);
  } finally {
    clearInterval(ping);
  }

  closeText();
  for (const block of toolBlocks.values()) sse(res, 'content_block_stop', { type: 'content_block_stop', index: block.index });

  sse(res, 'message_delta', {
    type: 'message_delta',
    delta: { stop_reason: stopReason(finish) ?? (toolBlocks.size ? 'tool_use' : 'end_turn'), stop_sequence: null },
    usage: { output_tokens: usage.output_tokens },
  });
  sse(res, 'message_stop', { type: 'message_stop' });
  res.end();
}

/* ------------------------------------------------------------------------------------- server */

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });

const sendJson = (res, code, obj) => {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) });
  res.end(body);
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/health') return sendJson(res, 200, { ok: true, upstream: UPSTREAM });

  // Claude Code asks for a token estimate before large requests; a character heuristic is enough
  // to keep it moving, since the real accounting happens upstream.
  if (url.pathname.endsWith('/messages/count_tokens') && req.method === 'POST') {
    const body = JSON.parse((await readBody(req)) || '{}');
    const text = JSON.stringify(body.messages ?? []) + (systemText(body.system) ?? '');
    return sendJson(res, 200, { input_tokens: Math.ceil(text.length / 4) });
  }

  if (!url.pathname.endsWith('/messages') || req.method !== 'POST') {
    return sendJson(res, 404, { type: 'error', error: { type: 'not_found_error', message: `no route for ${req.method} ${url.pathname}` } });
  }

  let body;
  try {
    body = JSON.parse((await readBody(req)) || '{}');
  } catch {
    return sendJson(res, 400, { type: 'error', error: { type: 'invalid_request_error', message: 'body is not valid JSON' } });
  }

  const upstreamBody = buildUpstreamBody(body);
  log(req.method, url.pathname, '->', upstreamBody.model, upstreamBody.stream ? '(stream)' : '', `${upstreamBody.messages.length} msgs`);

  let upstream;
  try {
    upstream = await fetch(`${UPSTREAM}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${KEY}` },
      body: JSON.stringify(upstreamBody),
    });
  } catch (err) {
    return sendJson(res, 502, { type: 'error', error: { type: 'api_error', message: `cannot reach ${UPSTREAM}: ${err.message}` } });
  }

  if (!upstream.ok) {
    const text = await upstream.text();
    log('upstream error', upstream.status, text.slice(0, 200));
    let message = text.slice(0, 500);
    try {
      message = JSON.parse(text)?.error?.message ?? message;
    } catch {
      /* keep the raw text */
    }
    const type =
      upstream.status === 401 ? 'authentication_error' : upstream.status === 429 ? 'rate_limit_error' : upstream.status === 404 ? 'not_found_error' : 'api_error';
    return sendJson(res, upstream.status, { type: 'error', error: { type, message } });
  }

  if (upstreamBody.stream) return pipeStream(upstream, res, body.model);

  const oa = await upstream.json();
  return sendJson(res, 200, toAnthropicResponse(oa, body.model));
});

// A pidfile is how the launcher finds us: starting the proxy from zsh with an env prefix and a
// redirect makes $! the forked subshell rather than node, so killing $! would orphan this process.
const pidFile = process.env.CODECRAFT_PROXY_PIDFILE;
function removePidFile() {
  if (pidFile) {
    try {
      unlinkSync(pidFile);
    } catch {
      /* already gone */
    }
  }
}

server.listen(PORT, '127.0.0.1', () => {
  if (pidFile) {
    try {
      writeFileSync(pidFile, String(process.pid));
    } catch (err) {
      log('could not write pidfile', err.message);
    }
  }
  console.error(`[proxy] http://127.0.0.1:${PORT} -> ${UPSTREAM}/chat/completions`);
});

for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(sig, () => {
    removePidFile();
    process.exit(0);
  });
}
process.on('exit', removePidFile);
