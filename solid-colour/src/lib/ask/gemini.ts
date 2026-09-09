/**
 * Gemini, called directly from the browser in development.
 *
 * The key comes from VITE_GEMINI_API_KEY in .env. Anything prefixed VITE_ is compiled into the
 * bundle, so this path is for local use; in production point the app at the registry API
 * (VITE_ATLAS_API_URL), which keeps GEMINI_API_KEY on the server and does the same work.
 */
import type { AskMatch, IndexedComponent } from './types';

const KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const CHAT_MODEL = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) ?? 'gemini-flash-latest';
const EMBED_MODEL = (import.meta.env.VITE_GEMINI_EMBED_MODEL as string | undefined) ?? 'gemini-embedding-001';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
/** Ranking needs no deliberation: keep thinking low so answers come back in seconds. */
const THINKING = (import.meta.env.VITE_GEMINI_THINKING as string | undefined) ?? 'low';

export const geminiAvailable = Boolean(KEY);

async function call(path: string, body: unknown, timeoutMs: number, attempt = 1): Promise<Record<string, unknown> & { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; embedding?: { values: number[] } }> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': KEY! },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    // A dropped connection (network change, flaky wifi) gets one quick second try.
    if (attempt < 2 && !(err instanceof DOMException && err.name === 'TimeoutError')) {
      await new Promise((r) => setTimeout(r, 400));
      return call(path, body, timeoutMs, attempt + 1);
    }
    throw err;
  }
  if ((res.status === 503 || res.status === 429) && attempt < 2) {
    // Overloaded or rate-limited: one more try after a short pause, then the caller falls back.
    await new Promise((r) => setTimeout(r, 1200));
    return call(path, body, timeoutMs, attempt + 1);
  }
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  return res.json();
}

/** Embeds the request the same way the catalogue was embedded, so cosine similarity is meaningful. */
export async function embedQuery(text: string, dim: number): Promise<Float32Array> {
  const data = await call(`${EMBED_MODEL}:embedContent`, {
    model: `models/${EMBED_MODEL}`,
    content: { parts: [{ text }] },
    taskType: 'RETRIEVAL_QUERY',
    outputDimensionality: dim,
  }, 12_000);
  if (!data.embedding) throw new Error('gemini: no embedding in response');
  const v = Float32Array.from(data.embedding.values);
  let n = 0;
  for (const x of v) n += x * x;
  n = Math.sqrt(n) || 1;
  for (let i = 0; i < v.length; i++) v[i] /= n;
  return v;
}

export interface Ranking {
  summary: string;
  picks: Array<{ slug: string; why: string }>;
}

/** The context the model works from: what Garden is, what it can hand back, and how to choose. */
export const SYSTEM_PROMPT = `You are Garden, a component finder for React developers.
Garden indexes open-source UI component libraries (shadcn/ui, Magic UI, Aceternity, KokonutUI, Animate UI, Kibo UI, React Bits and many more). Every indexed component carries an install path: most install with one shadcn CLI command that pulls the component straight from its own library; some are npm packages; a few are copy-paste code.

You receive a developer's request and a numbered list of candidate components retrieved from the index. Your job:
1. Pick the candidates that best satisfy the request — up to the number asked for, best first. Judge by what the component actually is (title, category, description, tags), not by keyword overlap alone.
2. Prefer components with a one-line install. When several are equally good, spread picks across different libraries.
3. For a broad request (a landing page, a dashboard), pick complementary pieces that together build it, and say how they fit.
4. Never invent a slug. Only use slugs from the candidate list. If nothing fits, return an empty picks list and say so plainly.
5. Write for a developer: concrete, short, no marketing language. The summary is two or three sentences.`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    summary: { type: 'STRING' },
    picks: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { slug: { type: 'STRING' }, why: { type: 'STRING' } },
        required: ['slug', 'why'],
      },
    },
  },
  required: ['summary', 'picks'],
} as const;

export function candidateLine(i: number, c: IndexedComponent): string {
  const install = c.installKind === 'shadcn' ? 'one-line install' : c.installKind === 'npm' ? 'npm package' : 'copy code';
  const desc = c.description ? ` — ${c.description.slice(0, 180)}` : '';
  const tags = c.tags.length ? ` [${c.tags.slice(0, 6).join(', ')}]` : '';
  return `${i + 1}. slug=${c.slug} | ${c.title} (${c.library}, ${c.category}, ${install})${desc}${tags}`;
}

/** Asks Gemini to rank the candidates for the request. Throws on any failure; callers fall back. */
export async function rankWithGemini(query: string, candidates: AskMatch[], k: number): Promise<Ranking> {
  const list = candidates.map((m, i) => candidateLine(i, m.component)).join('\n');
  const body = (thinking: boolean) => ({
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: `Request: ${query}\n\nCandidates:\n${list}\n\nPick up to ${k}.` }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      ...(thinking && THINKING !== 'off' ? { thinkingConfig: { thinkingLevel: THINKING } } : {}),
    },
  });
  let data;
  try {
    data = await call(`${CHAT_MODEL}:generateContent`, body(true), 30_000);
  } catch (err) {
    // Older models reject thinkingLevel with a 400; try once more without it.
    if (!/gemini 400/.test(String(err))) throw err;
    data = await call(`${CHAT_MODEL}:generateContent`, body(false), 30_000);
  }
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
  const parsed = JSON.parse(text) as Ranking;
  if (!parsed || !Array.isArray(parsed.picks)) throw new Error('gemini: malformed ranking');
  return parsed;
}
