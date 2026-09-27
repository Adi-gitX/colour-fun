/**
 * Answer cache on Upstash Redis (REST), free tier. A repeated question is served instantly and
 * spends no search or model quota. Off when no Upstash credentials are set.
 *
 * Accepts the Upstash console names (UPSTASH_REDIS_REST_URL / _TOKEN) or the ones the Vercel
 * Marketplace integration sets (KV_REST_API_URL / _TOKEN).
 */

const url = () => (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '').replace(/\/$/, '');
const token = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';

export const cacheEnabled = () => Boolean(url() && token());

async function command(args: Array<string | number>): Promise<unknown> {
  const res = await fetch(url(), {
    method: 'POST',
    headers: { authorization: `Bearer ${token()}`, 'content-type': 'application/json' },
    body: JSON.stringify(args),
    signal: AbortSignal.timeout(4_000),
  });
  if (!res.ok) throw new Error(`upstash ${res.status}`);
  return ((await res.json()) as { result?: unknown }).result ?? null;
}

/** Never throws: a cache that is down just means a fresh answer. */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!cacheEnabled()) return null;
  try {
    const raw = await command(['GET', key]);
    return typeof raw === 'string' ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (!cacheEnabled()) return;
  try {
    await command(['SET', key, JSON.stringify(value), 'EX', ttlSeconds]);
  } catch {
    // best effort
  }
}

/** "Footer designs!" and "footer   designs" are the same question. */
export const normalizeQuery = (q: string) =>
  q
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
