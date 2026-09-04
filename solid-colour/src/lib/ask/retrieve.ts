/**
 * Retrieval: how the catalogue is narrowed to a few dozen candidates before any model looks at it.
 *
 * Two signals, fused:
 *   - sparse: word scoring with synonyms over title, category, tags and description (always on)
 *   - dense:  cosine similarity between the request's Gemini embedding and each component's
 *             precomputed embedding (on when src/data/embeddings.bin exists and a query vector
 *             is available)
 * The two rankings are combined with reciprocal rank fusion, the standard way hybrid search
 * systems merge lexical and semantic results without tuning weights.
 */
import type { AskMatch, IndexedComponent } from './types';

/** Words people use that the libraries spell differently. */
export const SYNONYMS: Record<string, string[]> = {
  loader: ['spinner', 'loading', 'skeleton', 'progress'],
  loading: ['loader', 'spinner', 'skeleton'],
  spinner: ['loader', 'loading'],
  submit: ['form', 'button', 'input'],
  form: ['input', 'login', 'signup', 'contact', 'newsletter'],
  login: ['form', 'auth', 'sign in'],
  signup: ['form', 'auth', 'register'],
  carousel: ['slider', 'marquee', 'gallery', 'swiper'],
  slider: ['carousel', 'range'],
  landing: ['hero', 'section', 'cta', 'features'],
  hero: ['landing', 'header', 'banner'],
  navbar: ['header', 'navigation', 'menu', 'dock'],
  menu: ['navbar', 'dropdown', 'navigation'],
  modal: ['dialog', 'drawer', 'sheet', 'popover'],
  dialog: ['modal'],
  toast: ['notification', 'alert', 'sonner'],
  background: ['bg', 'particles', 'beams', 'aurora', 'gradient', 'grid'],
  animated: ['animation', 'motion', 'effect'],
  text: ['typewriter', 'shimmer', 'marquee', 'headline'],
  pricing: ['plans', 'tiers', 'subscription'],
  testimonial: ['reviews', 'quotes', 'clients'],
  card: ['tile', 'panel'],
  table: ['data', 'grid', 'list'],
  '3d': ['three', 'globe', 'shader', 'webgl'],
  glass: ['glassmorphism', 'blur', 'liquid'],
  sky: ['aurora', 'gradient', 'clouds', 'background'],
  chat: ['message', 'ai', 'conversation', 'prompt'],
  dashboard: ['chart', 'stat', 'table', 'sidebar', 'kanban'],
};

const STOP = new Set(['a', 'an', 'the', 'i', 'need', 'want', 'with', 'for', 'and', 'or', 'of', 'to', 'in', 'on', 'my', 'some', 'like', 'that', 'this', 'page', 'component', 'components', 'modern', 'nice', 'cool', 'good', 'best', 'ui', 'design', 'me', 'give', 'make', 'build', 'please', 'looking', 'something']);

export function keywordRank(components: IndexedComponent[], query: string): AskMatch[] {
  const words = query.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !STOP.has(w));
  if (words.length === 0) return [];
  const expanded = new Map<string, number>();
  for (const w of words) expanded.set(w, 1);
  for (const w of words) for (const syn of SYNONYMS[w] ?? []) if (!expanded.has(syn)) expanded.set(syn, 0.5);
  const out: AskMatch[] = [];
  for (const c of components) {
    const title = c.title.toLowerCase();
    const tags = c.tags.join(' ').toLowerCase();
    const desc = c.description.toLowerCase();
    let score = 0;
    let hits = 0;
    for (const [w, weight] of expanded) {
      let s = 0;
      if (title.includes(w)) s += 3;
      if (c.category.includes(w)) s += 2;
      if (tags.includes(w)) s += 1.5;
      if (desc.includes(w)) s += 1;
      if (s > 0) {
        hits += weight;
        score += s * weight;
      }
    }
    if (score === 0) continue;
    score += hits * 1.5;
    if (c.installCommand) score += 1;
    if (c.previewImage) score += 0.5;
    if (/demo|example/i.test(c.title)) score -= 1.5;
    out.push({ component: c, score, why: null });
  }
  return out.sort((a, b) => b.score - a.score);
}

export interface EmbeddingStore {
  dim: number;
  scale: number;
  slugs: string[];
  data: Int8Array;
}

let storePromise: Promise<EmbeddingStore | null> | null = null;
/** Loads the quantised catalogue vectors once; null when embeddings were never built. */
export function loadEmbeddings(): Promise<EmbeddingStore | null> {
  storePromise ??= (async () => {
    try {
      const meta = (await import('../../data/embeddings.json')).default as { dim: number; scale: number; slugs: string[] };
      if (!meta.dim || meta.slugs.length === 0) return null;
      const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
      const res = await fetch(`${base}/embeddings.bin`);
      if (!res.ok) return null;
      const data = new Int8Array(await res.arrayBuffer());
      // The dev server answers unknown paths with index.html; only trust a buffer of the right size.
      if (data.length !== meta.dim * meta.slugs.length) return null;
      return { ...meta, data };
    } catch {
      return null;
    }
  })();
  return storePromise;
}

/** Cosine similarity over int8 rows; the query is unit length, rows are unit length × scale. */
export function denseRank(store: EmbeddingStore, query: Float32Array, bySlug: Map<string, IndexedComponent>, limit: number): AskMatch[] {
  const { dim, scale, slugs, data } = store;
  const scored: Array<{ i: number; s: number }> = [];
  for (let i = 0; i < slugs.length; i++) {
    let dot = 0;
    const off = i * dim;
    for (let d = 0; d < dim; d++) dot += data[off + d] * query[d];
    scored.push({ i, s: dot / scale });
  }
  scored.sort((a, b) => b.s - a.s);
  const out: AskMatch[] = [];
  for (const { i, s } of scored) {
    const c = bySlug.get(slugs[i]);
    if (!c) continue;
    out.push({ component: c, score: s, why: null });
    if (out.length >= limit) break;
  }
  return out;
}

/** Reciprocal rank fusion: rank-based, so the two scorers need no calibration against each other. */
export function fuse(rankings: AskMatch[][], limit: number, k = 60): AskMatch[] {
  const acc = new Map<string, { m: AskMatch; s: number }>();
  for (const list of rankings) {
    list.forEach((m, rank) => {
      const key = m.component.slug;
      const cur = acc.get(key) ?? { m: { ...m, score: 0 }, s: 0 };
      cur.s += 1 / (k + rank + 1);
      acc.set(key, cur);
    });
  }
  return [...acc.values()]
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ m, s }) => ({ ...m, score: s }));
}
