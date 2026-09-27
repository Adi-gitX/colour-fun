/**
 * Garden's finder: which websites are genuinely the best place to get a given piece of design.
 *
 *   0. cache   the same question in the last 7 days is answered instantly, spending no quota.
 *   1. search  free web search (Tavily → Jina → Google) plus Hacker News for real discussion.
 *   2. judge   a free model (Groq → Gemini → OpenRouter) weighs Garden's hand-picked list against
 *              that evidence and picks the best sites, each with a concrete reason.
 *   3. verify  every pick is opened live and its own links followed to the exact section;
 *              anything that does not load is dropped.
 *
 * No index of site contents: every fresh answer is built from the web at request time.
 */
import sitesJson from '../src/data/sites.json' with { type: 'json' };
import type { Evidence, FindEvent, FindRequest, Site, SiteResult, SiteType } from '../src/lib/find/types.js';
import { cacheGet, cacheSet, normalizeQuery } from './cache.js';
import { judgeJson, NoModelAvailable, type JsonSchema } from './llm.js';
import { fetchPage, hostOf, type PageInfo } from './page.js';
import { webEvidence, type Source } from './search.js';

export const sites = sitesJson as Site[];

const TYPE_LABEL: Record<SiteType, string> = {
  components: 'component library',
  library: 'animation / UI library',
  inspiration: 'design inspiration gallery',
};

const JUDGE_SYSTEM = `You are the judge inside Garden. Garden helps people build websites that look like a person with taste designed them — never generic, templated "AI slop".

You receive a request, Garden's hand-picked list of sites, and numbered Sources from a live web search (with what each page says). Pick the sites that are genuinely the best place to get what was asked for.

Rules:
- Aim for the number asked when that many sites are genuinely good for this; go below it rather than add filler.
- You know Garden's list sites well: use that knowledge as well as the Sources. A list site with a strong section for this is a pick even if no Source mentions it.
- A site belongs only if it actually offers this kind of design as a real, findable section. If you cannot say where on the site it is, leave the site out. A popular general library is not a pick for "footers" unless it has strong footers.
- Prefer sites from Garden's list when they are strong for this. Add a site from the web only when the Sources show it is excellent for this request specifically; give it siteId "" and its homepage as url.
- Articles, listicles and forum threads are evidence, not picks. Pick the sites they point to.
- page: a URL copied exactly from the Sources that is the section or category page for this kind of design on that site (not a blog post, not a paginated view), or "". Never write a URL that is not in the Sources.
- why: one or two sentences with specifics — what is there, how much of it, the style, free or paid, what it is built with. No hype or filler words (stunning, seamless, elevate, unleash, cutting-edge, game-changer, robust, comprehensive, sleek).
- lookFor: a short, concrete pointer — the section to open or what to search for once there.
- evidence: numbers of the Sources that back the pick; empty if none do.
- summary: one or two plain sentences on how to approach this, written to the developer.`;

const JUDGE_SCHEMA: JsonSchema = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    picks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          siteId: { type: 'string' },
          name: { type: 'string' },
          url: { type: 'string' },
          type: { type: 'string', enum: ['components', 'library', 'inspiration'] },
          page: { type: 'string' },
          why: { type: 'string' },
          lookFor: { type: 'string' },
          evidence: { type: 'array', items: { type: 'integer' } },
        },
        required: ['siteId', 'name', 'url', 'type', 'page', 'why', 'lookFor', 'evidence'],
      },
    },
  },
  required: ['summary', 'picks'],
};

interface Pick {
  siteId: string;
  name: string;
  url: string;
  type: SiteType;
  page: string;
  why: string;
  lookFor: string;
  evidence: number[];
}

const isJudgement = (x: unknown): x is { summary: string; picks: Pick[] } =>
  typeof x === 'object' &&
  x !== null &&
  Array.isArray((x as { picks?: unknown }).picks) &&
  (x as { picks: unknown[] }).picks.every((p) => typeof p === 'object' && p !== null && typeof (p as Pick).why === 'string');

/** What a cached answer keeps: everything needed to replay it. */
interface CachedAnswer {
  at: number;
  search: string;
  judge: string;
  events: FindEvent[];
}

/**
 * A page is worth sending someone to when it is the section for this kind of design: not a blog
 * post, not page 6 of a list, not a tracking link. Pagination and tracking parameters are dropped.
 */
function cleanPage(url: string): string {
  try {
    const u = new URL(url);
    if (/\/(blog|news|posts?|articles?|changelog)(\/|$)/i.test(u.pathname)) return '';
    // Setup pages (install, getting started, CLI) are not where the design lives.
    if (/(install|installation|getting-started|get-started|quick-?start|introduction|setup|cli)(\.html)?\/?$/i.test(u.pathname)) return '';
    for (const key of [...u.searchParams.keys()]) {
      if (/page|^utm_|^ref$|^fbclid$|^gclid$/i.test(key)) u.searchParams.delete(key);
    }
    u.hash = '';
    return u.toString();
  } catch {
    return '';
  }
}

/** Words people use for a section, and what sites call it. */
const ALIASES: Record<string, string[]> = {
  navbar: ['navbar', 'navbars', 'navigation', 'nav', 'header', 'headers', 'menu'],
  navigation: ['navigation', 'navbar', 'nav', 'header', 'menu'],
  header: ['header', 'headers', 'navbar', 'navigation'],
  footer: ['footer', 'footers'],
  hero: ['hero', 'heroes', 'header', 'headers', 'landing'],
  pricing: ['pricing', 'price', 'plans'],
  testimonial: ['testimonial', 'testimonials', 'reviews', 'quotes'],
  cta: ['cta', 'call-to-action', 'ctas'],
  faq: ['faq', 'faqs', 'accordion'],
  feature: ['feature', 'features'],
  login: ['login', 'sign-in', 'signin', 'auth', 'authentication'],
  signup: ['signup', 'sign-up', 'register', 'auth'],
  dashboard: ['dashboard', 'dashboards', 'admin'],
  card: ['card', 'cards'],
  button: ['button', 'buttons'],
  form: ['form', 'forms', 'input', 'inputs'],
  modal: ['modal', 'modals', 'dialog', 'dialogs'],
  table: ['table', 'tables', 'data-table'],
  sidebar: ['sidebar', 'sidebars'],
  loader: ['loader', 'loaders', 'spinner', 'loading', 'skeleton'],
  carousel: ['carousel', 'slider', 'marquee'],
  background: ['background', 'backgrounds'],
  text: ['text', 'typography'],
  '404': ['404', 'error', 'not-found'],
  blog: ['blog', 'article'],
  contact: ['contact'],
  team: ['team'],
  stats: ['stats', 'statistics', 'metrics'],
};
const STOP = new Set('a an the and or for with of to in on my some best good nice modern design designs section sections page pages website site sites inspiration component components ui ideas examples template templates for that looks look like cool clean minimal'.split(' '));

function sectionWords(query: string): string[] {
  const words = query.toLowerCase().split(/[^a-z0-9-]+/).filter((w) => w.length > 1 && !STOP.has(w));
  const out = new Set<string>();
  for (const w of words) {
    const base = w.replace(/(ies)$/, 'y').replace(/s$/, '');
    for (const a of ALIASES[base] ?? ALIASES[w] ?? [w, base]) out.add(a);
  }
  return [...out];
}

/** Scores a link by how clearly its path or label names the section. */
function linkScore(link: { href: string; text: string }, words: string[]): number {
  const path = new URL(link.href).pathname.toLowerCase();
  const segs = path.split('/').filter(Boolean);
  const text = link.text.toLowerCase();
  let score = 0;
  for (const w of words) {
    if (segs.includes(w)) score += 4;
    else if (path.includes(w)) score += 2;
    if (new RegExp(`\\b${w.replace(/[-]/g, '\\-')}\\b`).test(text)) score += 2;
  }
  if (score === 0) return 0;
  if (/\/(blog|news|posts?|changelog|pricing)(\/|$)/.test(path) && !words.includes('pricing')) score -= 5;
  if (/(install|getting-started|quick-?start|introduction|setup)\/?$/.test(path)) score -= 5;
  return score - segs.length * 0.25;
}

/**
 * Follows the site's own links to the section for this request, the way a person would: look at
 * the page for a matching link; if none, open the most likely index page (components, blocks,
 * docs, browse) and look there. Two hops at most, all live.
 */
async function findSection(home: PageInfo, words: string[]): Promise<PageInfo | null> {
  if (words.length === 0) return null;
  // A site named for the thing (navbar.gallery, footer.design) is already the section.
  const host = hostOf(home.url);
  if (words.some((w) => host.includes(w))) return null;
  const best = (links: PageInfo['links']) =>
    links
      .map((l) => ({ l, s: linkScore(l, words) }))
      .filter((x) => x.s >= 4)
      .sort((a, b) => b.s - a.s)[0]?.l;
  let hit = best(home.links);
  if (!hit) {
    const hub = home.links.find((l) => /\/(components|blocks|sections|docs|browse|categories|library|ui|explore)\/?$/.test(new URL(l.href).pathname));
    if (hub) {
      const hubPage = await fetchPage(hub.href);
      if (hubPage.ok) hit = best(hubPage.links);
    }
  }
  if (!hit || hit.href.replace(/\/$/, '') === home.url.replace(/\/$/, '')) return null;
  const page = await fetchPage(hit.href);
  return page.ok && page.status === 200 ? page : null;
}

const sameSite = (a: string, b: string) => {
  const ha = hostOf(a);
  const hb = hostOf(b);
  return ha === hb || ha.endsWith(`.${hb}`) || hb.endsWith(`.${ha}`);
};

export async function find(req: FindRequest, emit: (e: FindEvent) => void): Promise<void> {
  const started = Date.now();
  const query = req.query.trim().slice(0, 300);
  const type = req.type ?? 'any';
  const count = Math.min(Math.max(req.count ?? 6, 1), 12);
  const pool = type === 'any' ? sites : sites.filter((s) => s.type === type);

  // ---- 0. cache --------------------------------------------------------------------------
  const cacheKey = `garden:find:v3:${type}:${count}:${normalizeQuery(query)}`;
  const cached = await cacheGet<CachedAnswer>(cacheKey);
  if (cached) {
    emit({ type: 'meta', search: cached.search, judge: cached.judge, cachedAt: cached.at });
    for (const e of cached.events) emit(e);
    emit({ type: 'done', ms: Date.now() - started, checked: 0 });
    return;
  }
  const replay: FindEvent[] = [];
  const keep = (e: FindEvent) => {
    replay.push(e);
    emit(e);
  };

  // ---- 1. search -------------------------------------------------------------------------
  emit({ type: 'stage', id: 'search', label: 'Searching the web for reviews and recommendations' });
  const domains = [...new Set(pool.map((s) => hostOf(s.url)))];
  const web = await webEvidence(query, type === 'any' ? '' : TYPE_LABEL[type], domains);
  const sources: Source[] = web.sources;
  if (sources.length) {
    keep({ type: 'sources', queries: web.queries, items: sources.map(({ title, url }) => ({ title, url })) });
  } else {
    emit({ type: 'note', text: 'Web search is resting right now, so this is judged from Garden’s list alone.' });
  }

  // ---- 2. judge --------------------------------------------------------------------------
  emit({ type: 'stage', id: 'judge', label: `Weighing ${pool.length} Garden sites against what the web says` });
  const list = pool.map((s) => `${s.id} | ${s.name} | ${hostOf(s.url)} | ${TYPE_LABEL[s.type]}${s.paid ? ' | paid' : ''}`).join('\n');
  const sourceList =
    sources.map((s, i) => `[${i + 1}] ${s.title} — ${s.url}${s.snippet ? `\n    ${s.snippet.slice(0, s.from === 'google' ? 3_000 : 300)}` : ''}`).join('\n') ||
    '(none)';
  const prompt = `Request: ${query}
Kind of site wanted: ${type === 'any' ? 'any' : TYPE_LABEL[type]}
Pick up to ${count}.

Garden's list (siteId | name | domain | kind):
${list}

Sources:
${sourceList}`;

  let picks: Pick[] = [];
  let summary = '';
  let judge = '';
  try {
    const res = await judgeJson<{ summary: string; picks: Pick[] }>({
      system: JUDGE_SYSTEM,
      prompt,
      schema: JUDGE_SCHEMA,
      valid: isJudgement,
    });
    picks = res.data.picks.slice(0, count);
    summary = res.data.summary ?? '';
    judge = res.model;
  } catch (err) {
    console.error('[find] judge failed', err);
    emit({
      type: 'error',
      message:
        err instanceof NoModelAvailable
          ? 'Every free AI model Garden uses is resting right now. Try again in a few minutes.'
          : 'The AI judge did not answer. Try again.',
    });
    emit({ type: 'done', ms: Date.now() - started, checked: 0 });
    return;
  }
  emit({ type: 'meta', search: web.provider, judge });

  // ---- 3. verify -------------------------------------------------------------------------
  emit({ type: 'stage', id: 'verify', label: `Opening ${picks.length} sites to check they are live` });
  const byId = new Map(sites.map((s) => [s.id, s]));
  const words = sectionWords(query);
  const sourceUrls = new Set(sources.map((s) => s.url));
  const sectionFound = new Map<number, boolean>();
  const checked = await Promise.all(
    picks.map(async (p, i): Promise<SiteResult | null> => {
      const listed = p.siteId ? byId.get(p.siteId) : undefined;
      if (p.siteId && !listed) return null; // an id the model made up
      if (listed && type !== 'any' && listed.type !== type) return null;
      const home = listed?.url ?? p.url;
      if (!/^https?:\/\//.test(home)) return null;
      // A page is only trusted when it came from the search sources and sits on the same site.
      const page = p.page && sourceUrls.has(p.page) && sameSite(p.page, home) ? cleanPage(p.page) : '';

      let info = await fetchPage(page || home);
      if (!info.ok && page) info = await fetchPage(home);
      if (!info.ok) return null;
      // No section page from the search: find it on the site itself.
      let located = Boolean(page) || words.some((w) => hostOf(home).includes(w));
      if (!located) {
        const section = await findSection(info, words);
        if (section) {
          info = { ...section, image: section.image ?? info.image };
          located = true;
        }
      }
      sectionFound.set(i, located);

      const evidence: Evidence[] = [...new Set(p.evidence ?? [])]
        .map((n) => sources[n - 1])
        .filter((s): s is Source => Boolean(s))
        .map(({ title, url }) => ({ title, url }))
        .slice(0, 4);
      // coss.com hosts both Origin UI and coss ui: name the pick after the list site whose URL
      // the final page actually sits under.
      const owner = sites
        .filter((s) => info.url.startsWith(s.url))
        .sort((a, b) => b.url.length - a.url.length)[0];
      const named = owner && owner.id !== listed?.id && sameSite(owner.url, home) ? owner : listed;
      return {
        rank: i + 1,
        name: named?.name ?? p.name,
        url: info.url,
        domain: hostOf(info.url),
        origin: listed ? 'garden' : 'web',
        type: listed?.type ?? p.type ?? null,
        paid: Boolean(listed?.paid),
        why: p.why,
        lookFor: p.lookFor ?? '',
        evidence,
        title: info.title,
        description: info.description,
        image: info.image,
      };
    })
  );

  // Sites where the exact section was found come first; homepage-only picks keep their order after.
  const results = checked
    .map((r, i) => ({ r, located: sectionFound.get(i) ?? false }))
    .filter((x): x is { r: SiteResult; located: boolean } => x.r !== null)
    .sort((a, b) => Number(b.located) - Number(a.located))
    .map(({ r }, i) => ({ ...r, rank: i + 1 }));
  for (const site of results) keep({ type: 'result', site });
  if (summary) keep({ type: 'summary', text: summary });
  if (results.length === 0) emit({ type: 'note', text: 'None of the picks could be opened just now. Try again, or reword the request.' });
  else await cacheSet(cacheKey, { at: Date.now(), search: web.provider, judge, events: replay } satisfies CachedAnswer, 7 * 24 * 3600);
  emit({ type: 'done', ms: Date.now() - started, checked: picks.length });
}
