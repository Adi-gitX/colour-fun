import { embedQuery, geminiAvailable, rankWithGemini } from './gemini';
import { denseRank, fuse, keywordRank, loadEmbeddings } from './retrieve';
import type { AskMatch, AskResponse, ComponentIndex, IndexedComponent } from './types';

export type * from './types';

const apiUrl = import.meta.env.VITE_ATLAS_API_URL as string | undefined;
const apiKey = import.meta.env.VITE_ATLAS_API_KEY as string | undefined;

/** Which engine answers: shown in the UI so the owner can see what a given deployment is doing. */
export const askEngine: 'gemini' | 'api' | 'local' = geminiAvailable ? 'gemini' : apiUrl ? 'api' : 'local';

let indexPromise: Promise<ComponentIndex> | null = null;
/** The index is a static file under /data, fetched once the first time anyone asks or searches. */
export function loadIndex(): Promise<ComponentIndex> {
  indexPromise ??= (async () => {
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    const res = await fetch(`${base}/data/index.json`);
    if (!res.ok) throw new Error(`index ${res.status}`);
    return (await res.json()) as ComponentIndex;
  })().catch((err) => {
    indexPromise = null; // let the next call retry
    throw err;
  });
  return indexPromise;
}

const queryVectorCache = new Map<string, Float32Array>();

/**
 * Candidate retrieval. Keyword ranking always runs; when the catalogue has embeddings and a query
 * vector can be produced, the dense ranking runs too and the two are fused by rank.
 */
async function retrieve(query: string, limit: number): Promise<{ matches: AskMatch[]; dense: boolean }> {
  const { components } = await loadIndex();
  const sparse = keywordRank(components, query);
  if (!geminiAvailable) return { matches: sparse.slice(0, limit), dense: false };
  const store = await loadEmbeddings();
  if (!store || store.slugs.length === 0) return { matches: sparse.slice(0, limit), dense: false };
  try {
    let qv = queryVectorCache.get(query);
    if (!qv) {
      qv = await embedQuery(query, store.dim);
      queryVectorCache.set(query, qv);
    }
    const bySlug = new Map(components.map((c) => [c.slug, c]));
    const denseList = denseRank(store, qv, bySlug, limit * 2);
    return { matches: fuse([sparse.slice(0, limit * 2), denseList], limit), dense: true };
  } catch {
    return { matches: sparse.slice(0, limit), dense: false };
  }
}

/** Local search over the bundled index. Always available, no keys, no network. */
export async function searchLocal(query: string, k = 12): Promise<AskResponse> {
  const { components } = await loadIndex();
  return { query, mode: 'search', summary: null, matches: keywordRank(components, query).slice(0, k) };
}

async function askViaApi(query: string, k: number): Promise<AskResponse> {
  const res = await fetch(`${apiUrl!.replace(/\/$/, '')}/api/v1/ask`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}) },
    body: JSON.stringify({ query, k }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`ask ${res.status}`);
  return (await res.json()) as AskResponse;
}

/**
 * The finder. Retrieves candidates (hybrid when possible), then asks Gemini to pick and explain.
 * Every failure degrades one step rather than erroring: Gemini → fused retrieval → keyword search.
 */
export interface AskOptions {
  /** Called as soon as retrieval has candidates, before the model has ranked them. */
  onCandidates?: (partial: AskResponse) => void;
}

export async function ask(query: string, k = 8, options: AskOptions = {}): Promise<AskResponse> {
  const q = query.trim();
  if (!q) return { query: q, mode: 'search', summary: null, matches: [] };

  if (askEngine === 'api') {
    try {
      const local = await searchLocal(q, k);
      if (local.matches.length) options.onCandidates?.(local);
      return await askViaApi(q, k);
    } catch {
      return searchLocal(q, k);
    }
  }

  const { matches: candidates } = await retrieve(q, Math.max(k * 3, 24));
  if (askEngine !== 'gemini' || candidates.length === 0) {
    return { query: q, mode: 'search', summary: null, matches: candidates.slice(0, k) };
  }
  options.onCandidates?.({ query: q, mode: 'search', summary: null, matches: candidates.slice(0, k) });
  try {
    const ranking = await rankWithGemini(q, candidates, k);
    const bySlug = new Map(candidates.map((m) => [m.component.slug, m]));
    const picked: AskMatch[] = [];
    for (const p of ranking.picks) {
      const m = bySlug.get(p.slug);
      if (m && !picked.some((x) => x.component.slug === m.component.slug)) picked.push({ ...m, why: p.why });
    }
    for (const m of candidates) {
      if (picked.length >= k) break;
      if (!picked.some((x) => x.component.slug === m.component.slug)) picked.push(m);
    }
    return { query: q, mode: 'agent', summary: ranking.summary || null, matches: picked.slice(0, k) };
  } catch {
    return { query: q, mode: 'search', summary: null, matches: candidates.slice(0, k) };
  }
}

/** A paste-ready block for Claude Code, Cursor or any coding agent. */
export function promptFor(match: AskMatch, request: string): string {
  const c: IndexedComponent = match.component;
  const lines = [
    `Add the "${c.title}" component from ${c.library} to this project.`,
    request ? `Context: I asked for "${request}".` : '',
    match.why ? `Why this one: ${match.why}` : '',
    '',
  ];
  if (c.installKind === 'shadcn' && c.installCommand) {
    lines.push('Install it with the shadcn CLI (it pulls the component from the library directly):', '', '```bash', c.installCommand, '```', '');
    lines.push('Then import it from the path the CLI printed (usually `@/components/ui/…`) and use it where appropriate.');
  } else if (c.installKind === 'npm' && c.installCommand) {
    lines.push('Install the package:', '', '```bash', c.installCommand, '```', '', `Follow the usage in the docs: ${c.docsUrl}`);
  } else if (c.code) {
    lines.push(`Create \`${c.codePath ?? 'component.tsx'}\` with this code:`, '', '```tsx', c.code, '```');
    if (c.dependencies.length) lines.push('', `Install its dependencies: \`npm install ${c.dependencies.join(' ')}\``);
  } else {
    lines.push(`Source and usage: ${c.docsUrl}`);
  }
  lines.push('', `Credit: ${c.library}${c.author ? ` by ${c.author}` : ''} (${c.license}). ${c.sourceUrl}`);
  return lines.filter((l) => l !== '').join('\n');
}

/** Bundle several matches into one prompt, e.g. everything a landing page needs. */
export function promptForAll(matches: AskMatch[], request: string): string {
  const head = `Build this: "${request}". Use these components, installed from their own libraries:\n`;
  return head + '\n' + matches.map((m, i) => `${i + 1}. ${promptFor(m, '')}`).join('\n\n---\n\n');
}
