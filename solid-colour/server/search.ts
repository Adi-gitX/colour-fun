/**
 * Web evidence for a request, from free providers in order of preference:
 *
 *   Tavily (1,000 searches/month)  →  Jina (10M tokens)  →  Gemini + Google Search (20/day)
 *
 * Hacker News (Algolia, no key) always runs alongside for real community discussion. Results are
 * cached for three days, so the same question never spends search quota twice.
 */
import { cacheGet, cacheSet, normalizeQuery } from './cache.js';
import { generate, GeminiError, SEARCH_MODELS } from './gemini.js';
import { resolveRedirect } from './page.js';

export interface Source {
  title: string;
  url: string;
  /** What the page says, trimmed; this is what the judge reads. */
  snippet: string;
  from: 'tavily' | 'jina' | 'google' | 'hn';
}

export interface Evidence {
  provider: string;
  queries: string[];
  sources: Source[];
}

/** Providers that answered 429 recently are skipped for a while instead of retried every time. */
const cooldown = new Map<string, number>();
const cooling = (name: string) => (cooldown.get(name) ?? 0) > Date.now();
const coolDown = (name: string, ms = 10 * 60_000) => cooldown.set(name, Date.now() + ms);

class QuotaError extends Error {}

const clip = (s: string | undefined, n: number) => (s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

function phrasings(query: string, kind: string): string[] {
  return [`best websites for ${query}${kind ? ` (${kind})` : ''}`, `${query} design inspiration sites recommended reddit review`];
}

/** At most `n` results per domain, so one big site cannot crowd out the rest. */
function capPerDomain(sources: Source[], n: number): Source[] {
  const count = new Map<string, number>();
  return sources.filter((s) => {
    let host = '';
    try {
      host = new URL(s.url).hostname.replace(/^www\./, '');
    } catch {
      return false;
    }
    const c = count.get(host) ?? 0;
    count.set(host, c + 1);
    return c < n;
  });
}

interface TavilyQuery {
  q: string;
  /** Restrict to these domains (Garden's own sites) to find their exact section pages. */
  domains?: string[];
}

async function tavily(queries: TavilyQuery[]): Promise<Source[]> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) throw new Error('no key');
  const runs = await Promise.all(
    queries.map(async ({ q, domains }) => {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          query: q,
          max_results: domains ? 20 : 8,
          search_depth: 'basic',
          include_answer: false,
          ...(domains ? { include_domains: domains } : {}),
        }),
        signal: AbortSignal.timeout(20_000),
      });
      if (res.status === 429 || res.status === 432 || res.status === 433) throw new QuotaError(`tavily ${res.status}`);
      if (!res.ok) throw new Error(`tavily ${res.status}`);
      const data = (await res.json()) as { results?: Array<{ title?: string; url?: string; content?: string }> };
      const found = (data.results ?? []).map((r) => ({ title: clip(r.title, 120), url: r.url ?? '', snippet: clip(r.content, 400), from: 'tavily' as const }));
      return domains ? capPerDomain(found, 2) : found;
    })
  );
  return runs.flat();
}

async function jina(queries: string[]): Promise<Source[]> {
  const key = process.env.JINA_API_KEY;
  if (!key) throw new Error('no key');
  const runs = await Promise.all(
    queries.map(async (q) => {
      const res = await fetch(`https://s.jina.ai/?q=${encodeURIComponent(q)}`, {
        headers: { authorization: `Bearer ${key}`, accept: 'application/json', 'x-respond-with': 'no-content' },
        signal: AbortSignal.timeout(30_000),
      });
      if (res.status === 402 || res.status === 429) throw new QuotaError(`jina ${res.status}`);
      if (!res.ok) throw new Error(`jina ${res.status}`);
      const data = (await res.json()) as { data?: Array<{ title?: string; url?: string; description?: string }> };
      return (data.data ?? []).slice(0, 8).map((r) => ({ title: clip(r.title, 120), url: r.url ?? '', snippet: clip(r.description, 400), from: 'jina' as const }));
    })
  );
  return runs.flat();
}

async function google(query: string, kind: string): Promise<{ sources: Source[]; queries: string[] }> {
  if (!process.env.GEMINI_API_KEY) throw new Error('no key');
  try {
    const res = await generate(SEARCH_MODELS, {
      prompt: `A developer building a website wants: "${query}". Search the web for the websites where the best ${query} can be found${kind ? ` (${kind})` : ''}. Look for reviews, Reddit / Hacker News / X threads and roundups. For each site give its name, the most specific URL for this, and what people say about it.`,
      search: true,
      timeoutMs: 60_000,
    });
    const raw = res.grounding?.sources ?? [];
    const sources = await Promise.all(
      raw.map(async (s) => ({ title: s.title, url: await resolveRedirect(s.uri), snippet: '', from: 'google' as const }))
    );
    // Grounded answers carry their findings in the text, not per source; hand it to the judge once.
    if (sources[0]) sources[0].snippet = clip(res.text, 3_000);
    return { sources, queries: res.grounding?.queries ?? [] };
  } catch (err) {
    if (err instanceof GeminiError && err.status === 429) throw new QuotaError('google 429');
    throw err;
  }
}

async function hackerNews(query: string): Promise<Source[]> {
  const words = normalizeQuery(query)
    .split(' ')
    .filter((w) => w.length > 2 && !['the', 'and', 'for', 'with', 'designs', 'design'].includes(w));
  const q = [...words, 'design'].join(' ');
  try {
    const res = await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=10`, {
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      hits?: Array<{ title?: string; url?: string | null; points?: number; num_comments?: number; objectID: string }>;
    };
    return (data.hits ?? [])
      .filter((h) => (h.points ?? 0) >= 5 && h.url)
      .slice(0, 5)
      .map((h) => ({
        title: clip(h.title, 120),
        url: h.url!,
        snippet: `Hacker News story: ${h.points} points, ${h.num_comments ?? 0} comments (https://news.ycombinator.com/item?id=${h.objectID}).`,
        from: 'hn' as const,
      }));
  } catch {
    return [];
  }
}

type Run = (query: string, kind: string, domains: string[]) => Promise<{ sources: Source[]; queries: string[] }>;

const PROVIDERS: Array<{ name: string; run: Run }> = [
  {
    name: 'Tavily',
    run: async (q, k, domains) => {
      const open = phrasings(q, k);
      const inGarden = `${q} section components examples`;
      const sources = await tavily([...open.map((x) => ({ q: x })), { q: inGarden, domains }]);
      return { sources, queries: [...open, `${inGarden} (on Garden's sites)`] };
    },
  },
  { name: 'Jina', run: async (q, k) => ({ sources: await jina(phrasings(q, k)), queries: phrasings(q, k) }) },
  { name: 'Google Search', run: (q, k) => google(q, k) },
];

/**
 * @param domains Garden's site domains; the primary provider also searches inside them for the
 *                exact section pages.
 */
export async function webEvidence(query: string, kind: string, domains: string[]): Promise<Evidence> {
  const key = `garden:search:v2:${kind}:${normalizeQuery(query)}`;
  const hit = await cacheGet<Evidence>(key);
  if (hit) return hit;

  const hn = hackerNews(query);
  let found: { name: string; sources: Source[]; queries: string[] } | null = null;
  const failures: string[] = [];
  for (const p of PROVIDERS) {
    if (cooling(p.name)) {
      failures.push(`${p.name} (resting)`);
      continue;
    }
    try {
      const r = await p.run(query, kind, domains);
      if (r.sources.length) {
        found = { name: p.name, ...r };
        break;
      }
      failures.push(`${p.name} (no results)`);
    } catch (err) {
      if (err instanceof QuotaError) coolDown(p.name);
      if (!(err instanceof Error && err.message === 'no key')) failures.push(`${p.name} (${String(err).slice(0, 60)})`);
    }
  }

  const community = await hn;
  const seen = new Set<string>();
  const sources = [...(found?.sources ?? []), ...community].filter((s) => {
    if (!/^https?:\/\//.test(s.url) || seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });
  if (!found && failures.length) console.error('[search] all web providers failed:', failures.join(', '));

  const evidence: Evidence = {
    provider: [found?.name, community.length ? 'Hacker News' : null].filter(Boolean).join(' + ') || 'none',
    queries: found?.queries ?? [],
    sources: sources.slice(0, 30),
  };
  if (found) await cacheSet(key, evidence, 3 * 24 * 3600);
  return evidence;
}
