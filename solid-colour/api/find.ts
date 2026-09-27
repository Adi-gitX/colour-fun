/**
 * POST /api/find  { query, type?, count? }  →  NDJSON stream of FindEvent, one per line.
 *
 * Runs as a Vercel function; in development the Vite dev server mounts the same handler.
 */
import { find } from '../server/find.js';
import type { FindEvent, FindRequest } from '../src/lib/find/types.js';

export const config = { maxDuration: 120 };

const HARD_STOP_MS = 100_000;

/**
 * Each answer spends paid AI calls, so one visitor gets a handful per window. The count lives in
 * the function instance's memory: loose across many instances, enough to stop a runaway loop.
 */
const WINDOW_MS = 10 * 60_000;
const PER_WINDOW = Number(process.env.FIND_LIMIT_PER_10_MIN ?? 12);
const seen = new Map<string, number[]>();

function limited(request: Request): boolean {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local';
  const now = Date.now();
  const recent = (seen.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= PER_WINDOW) {
    seen.set(ip, recent);
    return true;
  }
  recent.push(now);
  seen.set(ip, recent);
  return false;
}

export async function POST(request: Request): Promise<Response> {
  let body: FindRequest;
  try {
    body = (await request.json()) as FindRequest;
  } catch {
    return Response.json({ error: 'Send JSON: { "query": "…" }' }, { status: 400 });
  }
  if (typeof body?.query !== 'string' || !body.query.trim()) {
    return Response.json({ error: 'query is required' }, { status: 400 });
  }

  if (limited(request)) {
    return Response.json(
      { error: 'That is a lot of questions in a short time. Give it a few minutes and ask again.' },
      { status: 429, headers: { 'retry-after': '300' } }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const emit = (e: FindEvent) => {
        if (!closed) controller.enqueue(encoder.encode(JSON.stringify(e) + '\n'));
      };
      const finish = () => {
        if (closed) return;
        closed = true;
        controller.close();
      };
      // Hard stop well inside Vercel's 120 s limit: the answer always ends with a clear message,
      // never a connection that is cut mid-way.
      const guard = setTimeout(() => {
        emit({ type: 'error', message: 'This one took too long. Try again, or ask a little more specifically.' });
        emit({ type: 'done', ms: HARD_STOP_MS, checked: 0 });
        finish();
      }, HARD_STOP_MS);
      try {
        await find(body, emit);
      } catch (err) {
        console.error('[find] crashed', err);
        emit({ type: 'error', message: 'Something broke on Garden’s side. Try again.' });
        emit({ type: 'done', ms: 0, checked: 0 });
      } finally {
        clearTimeout(guard);
        finish();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'application/x-ndjson; charset=utf-8',
      'cache-control': 'no-store',
      'x-accel-buffering': 'no',
    },
  });
}
