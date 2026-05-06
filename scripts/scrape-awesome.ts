/**
 * scripts/scrape-awesome.ts
 *
 * Devtool — pulls awesome-list READMEs, parses out every link with
 * `remark` + `remark-parse`, dedupes by GitHub repo, enriches each
 * entry with live `stargazers_count` / `pushed_at` / `license.spdx_id`
 * via the GitHub REST API, then drops anything that fails the
 * curation thresholds (< 500 stars or last commit > 18 months ago).
 *
 * Output goes to `solid-colour/src/data/generated/<bucket>.json` so
 * the runtime app can read it without paying the scrape cost on every
 * build. The TypeScript catalogs in `src/data/*.ts` remain the
 * curated, human-edited source of truth — this scraper is the
 * candidate-list generator that humans review.
 *
 * Sources (commit + date stamped at the top of each output file):
 *  - birobirobiro/awesome-shadcn-ui   (components)
 *  - brillout/awesome-react-components (components)
 *  - klaufel/awesome-design-systems    (designSystems)
 *  - notlmn/awesome-icons              (tools — Icons bucket)
 *  - Anmol-Baranwal/Awesome-Illustrations-4Projects (tools — Stock bucket)
 *  - brabadu/awesome-fonts             (fonts)
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_xxx npx tsx scripts/scrape-awesome.ts
 *   # or via gh CLI auth (no env needed):
 *   GH_AUTH_VIA_CLI=1 npx tsx scripts/scrape-awesome.ts
 *
 * No runtime deps. Only used at build / authoring time. Add
 * `remark`, `remark-parse`, `unist-util-visit`, and `tsx` as
 * devDependencies before running:
 *   npm install -D remark remark-parse unist-util-visit tsx
 */

/* eslint-disable no-console */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// remark + plugins are devDeps — see header for install. Type-only imports
// keep TS happy when the deps aren't yet installed.
type RootNode = { type: string; children?: RootNode[]; url?: string; value?: string };

interface Source {
  bucket:
    | 'components'
    | 'designSystems'
    | 'inspiration'
    | 'tools-icons'
    | 'tools-illustrations'
    | 'fonts';
  url: string;
  /** Optional repo override for source-attribution comments. */
  repo: string;
}

const SOURCES: Source[] = [
  {
    bucket: 'components',
    repo: 'birobirobiro/awesome-shadcn-ui',
    url: 'https://raw.githubusercontent.com/birobirobiro/awesome-shadcn-ui/main/README.md',
  },
  {
    bucket: 'components',
    repo: 'brillout/awesome-react-components',
    url: 'https://raw.githubusercontent.com/brillout/awesome-react-components/master/README.md',
  },
  {
    bucket: 'designSystems',
    repo: 'klaufel/awesome-design-systems',
    url: 'https://raw.githubusercontent.com/klaufel/awesome-design-systems/master/readme.md',
  },
  {
    bucket: 'tools-icons',
    repo: 'notlmn/awesome-icons',
    url: 'https://raw.githubusercontent.com/notlmn/awesome-icons/main/readme.md',
  },
  {
    bucket: 'tools-illustrations',
    repo: 'Anmol-Baranwal/Awesome-Illustrations-4Projects',
    url: 'https://raw.githubusercontent.com/Anmol-Baranwal/Awesome-Illustrations-4Projects/main/README.md',
  },
  {
    bucket: 'fonts',
    repo: 'brabadu/awesome-fonts',
    url: 'https://raw.githubusercontent.com/brabadu/awesome-fonts/master/README.md',
  },
];

interface ParsedLink {
  /** Display name used as the entry's `name`. */
  text: string;
  /** Resolved URL (could be a GitHub repo or any external site). */
  url: string;
  /** Surrounding context paragraph — reused as the description. */
  context: string;
}

interface EnrichedEntry extends ParsedLink {
  /** owner/repo when the link points to GitHub. */
  github?: string;
  stars?: number;
  pushedAt?: string;
  spdxLicense?: string | null;
}

const STARS_FLOOR = 500;
const STALE_AFTER_MONTHS = 18;

function isGithubRepo(url: string): string | null {
  const match = /^https?:\/\/(?:www\.)?github\.com\/([^/?#\s]+)\/([^/?#\s]+)/.exec(url);
  if (!match) return null;
  const repo = match[2].replace(/\.git$/, '');
  // exclude /releases, /tree, /blob etc.
  if (repo.startsWith('.') || repo.length === 0) return null;
  return `${match[1]}/${repo}`;
}

function isStale(pushedAt: string): boolean {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - STALE_AFTER_MONTHS);
  return new Date(pushedAt).getTime() < cutoff.getTime();
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.text();
}

async function parseMarkdownLinks(md: string): Promise<ParsedLink[]> {
  // Lazy-imported so the script fails loudly with a clear message if the
  // devDeps haven't been installed.
  let unified: typeof import('unified').unified;
  let remarkParse: typeof import('remark-parse').default;
  let visit: typeof import('unist-util-visit').visit;
  try {
    ({ unified } = await import('unified'));
    remarkParse = (await import('remark-parse')).default;
    ({ visit } = await import('unist-util-visit'));
  } catch (err) {
    console.error(
      'Missing devDeps. Run: npm install -D remark remark-parse unist-util-visit unified tsx',
    );
    throw err;
  }

  const tree = unified().use(remarkParse).parse(md) as RootNode;

  const links: ParsedLink[] = [];

  function nodeText(node: RootNode): string {
    if (node.value) return node.value;
    if (!node.children) return '';
    return node.children.map(nodeText).join('');
  }

  visit(tree as never, 'paragraph', (paragraph: RootNode) => {
    const context = nodeText(paragraph).replace(/\s+/g, ' ').trim();
    if (!paragraph.children) return;
    for (const child of paragraph.children) {
      if (child.type === 'link' && child.url) {
        const text = nodeText(child).trim();
        if (!text || text.length < 2) continue;
        links.push({ text, url: child.url, context });
      }
    }
  });

  return links;
}

async function ghApi<T>(path: string): Promise<T | null> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'atlas-scraper',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (res.status === 404 || res.status === 451) return null;
  if (res.status === 403) {
    const remaining = res.headers.get('x-ratelimit-remaining');
    if (remaining === '0') {
      console.warn('GitHub rate-limit hit — set GITHUB_TOKEN to raise the cap.');
    }
    return null;
  }
  if (!res.ok) {
    console.warn(`gh api ${path} -> ${res.status}`);
    return null;
  }
  return (await res.json()) as T;
}

interface RepoMeta {
  stargazers_count: number;
  pushed_at: string;
  license: { spdx_id: string | null } | null;
}

async function enrich(link: ParsedLink): Promise<EnrichedEntry | null> {
  const github = isGithubRepo(link.url);
  if (!github) {
    // Non-GitHub link: keep it but no GitHub stats.
    return { ...link };
  }
  const meta = await ghApi<RepoMeta>(`/repos/${github}`);
  if (!meta) return null;
  if (meta.stargazers_count < STARS_FLOOR) return null;
  if (isStale(meta.pushed_at)) return null;
  return {
    ...link,
    github,
    stars: meta.stargazers_count,
    pushedAt: meta.pushed_at,
    spdxLicense: meta.license?.spdx_id ?? null,
  };
}

function dedupe(entries: EnrichedEntry[]): EnrichedEntry[] {
  const seen = new Set<string>();
  const out: EnrichedEntry[] = [];
  for (const e of entries) {
    const key = (e.github ?? e.url).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

async function processSource(source: Source): Promise<EnrichedEntry[]> {
  console.log(`→ ${source.repo}`);
  const md = await fetchText(source.url);
  const links = await parseMarkdownLinks(md);
  console.log(`  parsed ${links.length} links`);
  const enriched: EnrichedEntry[] = [];
  for (const link of links) {
    const e = await enrich(link);
    if (e) enriched.push(e);
  }
  console.log(`  ${enriched.length} after curation thresholds`);
  return enriched;
}

async function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const outDir = resolve(here, '..', 'solid-colour', 'src', 'data', 'generated');
  await mkdir(outDir, { recursive: true });

  const byBucket: Record<string, EnrichedEntry[]> = {};

  for (const source of SOURCES) {
    const entries = await processSource(source);
    byBucket[source.bucket] = byBucket[source.bucket] ?? [];
    byBucket[source.bucket].push(...entries);
  }

  for (const bucket of Object.keys(byBucket)) {
    const deduped = dedupe(byBucket[bucket]).sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
    const sources = SOURCES.filter((s) => s.bucket === bucket).map((s) => s.repo);
    const payload = {
      _meta: {
        sources,
        scrapedAt: new Date().toISOString(),
        starsFloor: STARS_FLOOR,
        staleAfterMonths: STALE_AFTER_MONTHS,
      },
      entries: deduped,
    };
    const path = resolve(outDir, `${bucket}.json`);
    await writeFile(path, JSON.stringify(payload, null, 2) + '\n', 'utf8');
    console.log(`✔ wrote ${deduped.length} entries to ${path}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
