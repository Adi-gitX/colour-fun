/**
 * Structured JSON from the first free model that answers:
 *
 *   Groq gpt-oss-120b (1,000/day)  →  Gemini models, each with its own daily quota
 *   →  OpenRouter :free models (50/day)
 *
 * A provider that returns 429 rests for a while so later questions skip straight past it.
 */
import { generate, GeminiError } from './gemini.js';

export interface JsonSchema {
  type: 'object' | 'array' | 'string' | 'integer' | 'number' | 'boolean';
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  enum?: string[];
}

interface Call {
  system: string;
  prompt: string;
  schema: JsonSchema;
  /** Checks the parsed object; a model that returns the wrong shape counts as a failure. */
  valid: (x: unknown) => boolean;
}

export interface JsonResult<T> {
  data: T;
  model: string;
}

const cooldown = new Map<string, number>();
const cooling = (name: string) => (cooldown.get(name) ?? 0) > Date.now();

class RateLimited extends Error {}

/** Gemini's schema dialect: upper-case type names. */
function toGemini(s: JsonSchema): object {
  return {
    type: s.type.toUpperCase(),
    ...(s.enum ? { enum: s.enum } : {}),
    ...(s.required ? { required: s.required } : {}),
    ...(s.items ? { items: toGemini(s.items) } : {}),
    ...(s.properties ? { properties: Object.fromEntries(Object.entries(s.properties).map(([k, v]) => [k, toGemini(v)])) } : {}),
  };
}

/** Models sometimes wrap JSON in prose or a fence; take the outermost object. */
function parseJson(text: string): unknown {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('no JSON in reply');
  return JSON.parse(text.slice(start, end + 1));
}

async function openAiCompatible(
  endpoint: string,
  key: string,
  model: string,
  call: Call,
  extra: Record<string, unknown>
): Promise<string> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: `${call.system}\n\nReply with one JSON object matching this JSON Schema, and nothing else:\n${JSON.stringify(call.schema)}` },
        { role: 'user', content: call.prompt },
      ],
      ...extra,
    }),
    signal: AbortSignal.timeout(60_000),
  });
  const data = (await res.json().catch(() => ({}))) as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
  if (res.status === 429) throw new RateLimited(`${model}: ${data.error?.message ?? 'rate limited'}`);
  if (!res.ok) throw new Error(`${model} ${res.status}: ${data.error?.message ?? ''}`.slice(0, 200));
  return data.choices?.[0]?.message?.content ?? '';
}

interface Provider {
  name: string;
  enabled: () => boolean;
  run: (call: Call) => Promise<string>;
}

const GEMINI_JUDGES = (process.env.GEMINI_JUDGE_MODELS ??
  'gemini-3-flash-preview,gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-flash-lite-latest,gemini-flash-latest'
).split(',');

const OPENROUTER_FREE = (process.env.OPENROUTER_MODELS ?? 'nvidia/nemotron-3-super-120b-a12b:free,google/gemma-4-31b-it:free').split(',');

const PROVIDERS: Provider[] = [
  {
    name: 'Groq gpt-oss-120b',
    enabled: () => Boolean(process.env.GROQ_API_KEY),
    run: (call) =>
      openAiCompatible('https://api.groq.com/openai/v1/chat/completions', process.env.GROQ_API_KEY!, 'openai/gpt-oss-120b', call, {
        response_format: { type: 'json_object' },
        reasoning_effort: 'medium',
        max_completion_tokens: 4_000,
      }),
  },
  ...GEMINI_JUDGES.map(
    (model): Provider => ({
      name: `Gemini ${model.replace(/^gemini-/, '')}`,
      enabled: () => Boolean(process.env.GEMINI_API_KEY),
      run: async (call) => {
        try {
          const res = await generate([model], { system: call.system, prompt: call.prompt, schema: toGemini(call.schema), temperature: 0.2 });
          return res.text;
        } catch (err) {
          if (err instanceof GeminiError && err.status === 429) throw new RateLimited(err.message);
          throw err;
        }
      },
    })
  ),
  ...OPENROUTER_FREE.map(
    (model): Provider => ({
      name: `OpenRouter ${model.replace(/:free$/, '')}`,
      enabled: () => Boolean(process.env.OPENROUTER_API_KEY),
      run: (call) =>
        openAiCompatible('https://openrouter.ai/api/v1/chat/completions', process.env.OPENROUTER_API_KEY!, model, call, {
          response_format: { type: 'json_object' },
        }),
    })
  ),
];

export class NoModelAvailable extends Error {}

export async function judgeJson<T>(call: Call): Promise<JsonResult<T>> {
  const failures: string[] = [];
  for (const p of PROVIDERS) {
    if (!p.enabled() || cooling(p.name)) continue;
    try {
      const data = parseJson(await p.run(call));
      if (!call.valid(data)) throw new Error('reply had the wrong shape');
      return { data: data as T, model: p.name };
    } catch (err) {
      // Quota: rest this provider. Anything else: rest it briefly so a flaky model is not retried at once.
      cooldown.set(p.name, Date.now() + (err instanceof RateLimited ? 15 * 60_000 : 60_000));
      failures.push(`${p.name}: ${String(err).slice(0, 100)}`);
      console.error('[judge]', p.name, String(err).slice(0, 200));
    }
  }
  throw new NoModelAvailable(failures.length ? failures.join(' | ') : 'no AI provider is configured');
}
