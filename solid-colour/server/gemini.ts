/**
 * Gemini REST calls, server-side only. The key never reaches the browser.
 *
 * Google Search grounding runs on gemini-2.5-flash (the free tier refuses grounded calls on the
 * 3.x models); it is the last-resort web search. The judge chain in llm.ts calls the other Gemini
 * models one at a time, since each has its own free daily quota.
 */

const API = 'https://generativelanguage.googleapis.com/v1beta/models';

export const SEARCH_MODELS = (process.env.GEMINI_SEARCH_MODELS ?? 'gemini-2.5-flash').split(',');

export class GeminiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function key(): string {
  const k = process.env.GEMINI_API_KEY;
  if (!k) throw new GeminiError('GEMINI_API_KEY is not set on the server', 500);
  return k;
}

interface GenerateOptions {
  system?: string;
  prompt: string;
  /** JSON schema for structured output (Gemini's OpenAPI subset). */
  schema?: object;
  /** Turn on Google Search grounding. */
  search?: boolean;
  temperature?: number;
  timeoutMs?: number;
}

export interface GenerateResult {
  text: string;
  model: string;
  /** Present on grounded calls. */
  grounding?: {
    queries: string[];
    sources: Array<{ title: string; uri: string }>;
  };
}

interface RawResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    groundingMetadata?: {
      webSearchQueries?: string[];
      groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>;
    };
  }>;
  error?: { message?: string };
}

async function once(model: string, opts: GenerateOptions, thinking: boolean): Promise<GenerateResult> {
  const generationConfig: Record<string, unknown> = { temperature: opts.temperature ?? 0.3 };
  if (opts.schema) {
    generationConfig.responseMimeType = 'application/json';
    generationConfig.responseSchema = opts.schema;
  }
  // Only the 3.x-era "latest" aliases take thinkingLevel; 2.5 models reject it with a 400.
  if (thinking && !model.startsWith('gemini-2.')) generationConfig.thinkingConfig = { thinkingLevel: 'low' };

  const res = await fetch(`${API}/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key() },
    body: JSON.stringify({
      ...(opts.system ? { systemInstruction: { parts: [{ text: opts.system }] } } : {}),
      contents: [{ role: 'user', parts: [{ text: opts.prompt }] }],
      ...(opts.search ? { tools: [{ google_search: {} }] } : {}),
      generationConfig,
    }),
    signal: AbortSignal.timeout(opts.timeoutMs ?? 60_000),
  });
  const data = (await res.json().catch(() => ({}))) as RawResponse;
  if (!res.ok) throw new GeminiError(`${model}: ${data.error?.message ?? res.statusText}`, res.status);

  const cand = data.candidates?.[0];
  const text = cand?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  const gm = cand?.groundingMetadata;
  return {
    text,
    model,
    grounding: gm
      ? {
          queries: gm.webSearchQueries ?? [],
          sources: (gm.groundingChunks ?? [])
            .map((c) => ({ title: c.web?.title ?? '', uri: c.web?.uri ?? '' }))
            .filter((s) => s.uri),
        }
      : undefined,
  };
}

/**
 * Generate with the first model that answers. Quota (429) and overload (503) move on to the next
 * model after one short retry; a 400 about thinking retries the same model without it.
 */
export async function generate(models: string[], opts: GenerateOptions): Promise<GenerateResult> {
  let last: unknown;
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await once(model, opts, attempt === 0);
      } catch (err) {
        last = err;
        const status = err instanceof GeminiError ? err.status : 0;
        if (status === 400 && attempt === 0) continue;
        if ((status === 503 || status === 0) && attempt === 0) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        break;
      }
    }
  }
  throw last instanceof Error ? last : new Error(String(last));
}
