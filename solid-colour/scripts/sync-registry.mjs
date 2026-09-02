#!/usr/bin/env node
/**
 * Builds the app's search index from the atlas-registry ingest. One command, no manual steps.
 *
 *   node scripts/sync-registry.mjs
 *   ATLAS_REGISTRY_DIR=/path/to/atlas-registry node scripts/sync-registry.mjs
 *
 * Outputs (all under src/data/):
 *   index.json        every ingested component with the install command that pulls it straight
 *                     from its own library — no re-hosting, no copied code for registry sources
 *   libraries.json    every site in sources/sources.yaml with homepage, licence, status, counts
 *   preview-manifest.ts  which slugs have a rendered preview under public/previews/ (optional)
 *
 * Wired into `npm run build` as a prebuild step so a deploy is always current.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const registry = resolve(process.env.ATLAS_REGISTRY_DIR ?? join(app, '..', '..', 'atlas-registry'));
const rawDir = join(registry, 'data', 'raw');
const previewsSrc = join(registry, 'data', 'previews');
const sourcesYaml = join(registry, 'sources', 'sources.yaml');
const previewsDst = join(app, 'public', 'previews');
const dataDir = join(app, 'src', 'data');
// The component index is fetched at runtime, not imported: 6 MB of JSON has no place in the bundle.
const publicDataDir = join(app, 'public', 'data');
mkdirSync(publicDataDir, { recursive: true });

if (!existsSync(rawDir)) {
  console.error(`[sync-registry] no ingested data at ${rawDir} — run the atlas-registry ingest first`);
  process.exit(1);
}

// ---------------------------------------------------------------------------------------------
// sources.yaml — a small reader for the manifest's shape: `- id:` blocks with one nested level.
// ---------------------------------------------------------------------------------------------
function readSources(text) {
  const out = [];
  let cur = null;
  let nested = null;
  for (const line of text.split('\n')) {
    const item = /^  - (?:\{ )?id: ([a-z0-9-]+)/.exec(line);
    if (item) {
      cur = { id: item[1] };
      nested = null;
      out.push(cur);
      const inline = /\{(.*)\}/.exec(line);
      if (inline) {
        for (const kv of inline[1].split(',')) {
          const m = /^\s*([a-zA-Z]+):\s*"?([^"]*)"?\s*$/.exec(kv);
          if (m) cur[m[1]] = m[2].trim();
        }
      }
      continue;
    }
    if (!cur) continue;
    const block = /^    ([a-zA-Z]+):\s*$/.exec(line); // `    registry:`
    if (block) {
      nested = block[1];
      cur[nested] = cur[nested] ?? {};
      continue;
    }
    const inlineBlock = /^    ([a-zA-Z]+): \{(.*)\}$/.exec(line); // `    npm: { packages: [...] }`
    if (inlineBlock) {
      const obj = {};
      const pk = /packages:\s*\[(.*)\]/.exec(inlineBlock[2]);
      if (pk) obj.packages = pk[1].split(',').map((s) => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
      cur[inlineBlock[1]] = obj;
      nested = null;
      continue;
    }
    const kv6 = /^      ([a-zA-Z]+): (.+)$/.exec(line);
    if (kv6 && nested) {
      let v = kv6[2].trim().replace(/^"|"$/g, '');
      if (v.startsWith('[')) v = v.slice(1, -1).split(',').map((s) => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
      cur[nested][kv6[1]] = v;
      continue;
    }
    const kv4 = /^    ([a-zA-Z]+): (.+)$/.exec(line);
    if (kv4) {
      nested = null;
      const v = kv4[2].trim();
      if (!v.startsWith('>-')) cur[kv4[1]] = v.replace(/^"|"$/g, '');
    }
  }
  return out;
}
const sources = existsSync(sourcesYaml) ? readSources(readFileSync(sourcesYaml, 'utf8')) : [];
const sourceById = Object.fromEntries(sources.map((s) => [s.id, s]));

// ---------------------------------------------------------------------------------------------
// Install command: the whole point. Pull the component from its own library, nothing re-hosted.
// ---------------------------------------------------------------------------------------------
function installFor(raw, source) {
  const kind = raw.sourceKind;
  if (kind === 'shadcn-registry' && source?.registry?.itemUrl) {
    const url = source.registry.itemUrl.replace('{name}', encodeURIComponent(raw.name).replace(/%2F/g, '/'));
    return { installKind: 'shadcn', installCommand: `npx shadcn@latest add "${url}"`, registryUrl: url, packages: [] };
  }
  if (kind === 'npm-package') {
    const pkgs = source?.npm?.packages ?? [raw.name];
    return { installKind: 'npm', installCommand: `npm install ${pkgs.join(' ')}`, registryUrl: null, packages: pkgs };
  }
  // GitHub repositories and HTML snippet sites: the code is the deliverable.
  return { installKind: 'copy', installCommand: null, registryUrl: null, packages: raw.dependencies ?? [] };
}

// ---------------------------------------------------------------------------------------------
// Category heuristic — one vocabulary across every library so "loader" finds loaders everywhere.
// ---------------------------------------------------------------------------------------------
const CATEGORY_RULES = [
  ['hero', /hero|landing|jumbotron/],
  ['pricing', /pricing|plan/],
  ['navbar', /navbar|header|nav\b|menu-bar|dock/],
  ['footer', /footer/],
  ['button', /button|cta|btn/],
  ['card', /card|tile/],
  ['text-effect', /text|typewriter|marquee|shimmer|word|letter|glitch|scramble|split/],
  ['background', /background|bg|particle|beam|aurora|grid|dots|noise|gradient|wave|orb|ripple|meteor/],
  ['loader', /loader|spinner|skeleton|progress|loading/],
  ['input', /input|select|checkbox|radio|switch|textarea|slider|combobox|otp|picker|search/],
  ['form', /form|login|signup|sign-in|register|auth/],
  ['overlay', /modal|dialog|drawer|sheet|popover|tooltip|dropdown|hover-card|context-menu/],
  ['data-display', /table|list|chart|stat|kanban|gantt|calendar|timeline|tree|graph/],
  ['feedback', /toast|alert|badge|notification|banner|sonner/],
  ['navigation', /tabs|breadcrumb|pagination|sidebar|stepper|command|navigation/],
  ['media', /avatar|image|carousel|video|gallery|logo|icon/],
  ['3d', /three|3d|globe|shader|webgl|scene/],
  ['animation', /animat|motion|transition|reveal|cursor|scroll|magnetic|spotlight|glow|flip/],
  ['section', /section|testimonial|feature|faq|about|team|contact|stats|bento|showcase/],
  ['layout', /layout|container|grid-layout|split|resizable|scroll-area|separator|aspect/],
];
function categorize(raw) {
  if (raw.sourceKind === 'npm-package') return 'capability';
  const hay = [raw.name, raw.title, ...(raw.categories ?? []), ...(raw.tags ?? [])].join(' ').toLowerCase();
  for (const [cat, re] of CATEGORY_RULES) if (re.test(hay)) return cat;
  return 'other';
}
const titleCase = (s) =>
  s.replace(/[-_/]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bUi\b/g, 'UI').trim();
const slugOf = (raw) =>
  `${raw.source}-${raw.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------------------------------------------------------------------------------------------
// previews (optional — only used to decorate results when the render stage produced one)
// ---------------------------------------------------------------------------------------------
rmSync(previewsDst, { recursive: true, force: true });
mkdirSync(previewsDst, { recursive: true });
let images = [];
if (existsSync(previewsSrc)) {
  cpSync(previewsSrc, previewsDst, { recursive: true, filter: (src) => !src.includes('preview.js') });
  images = readdirSync(previewsDst)
    .filter((n) => n.endsWith('.png') && !n.endsWith('.dark.png'))
    .map((n) => n.replace(/\.png$/, ''));
}
const imageSet = new Set(images);
/** Rendered previews were named by the pipeline's slug rule (bare name for shadcn/ui). */
const previewSlugFor = (raw) => (raw.source === 'shadcn' ? raw.name : slugOf(raw));
writeFileSync(
  join(dataDir, 'preview-manifest.ts'),
  `/* AUTO-GENERATED by scripts/sync-registry.mjs — do not edit. */
export const previewImages: string[] = ${JSON.stringify(images.sort())};
`
);

// ---------------------------------------------------------------------------------------------
// index.json
// ---------------------------------------------------------------------------------------------
const index = [];
const perSource = {};
for (const sourceId of readdirSync(rawDir)) {
  if (sourceId.startsWith('_') || !statSync(join(rawDir, sourceId)).isDirectory()) continue;
  const source = sourceById[sourceId];
  for (const file of readdirSync(join(rawDir, sourceId))) {
    if (!file.endsWith('.json')) continue;
    let raw;
    try {
      raw = JSON.parse(readFileSync(join(rawDir, sourceId, file), 'utf8'));
    } catch {
      continue;
    }
    if (raw.sourceKind === 'inspiration') continue;
    const install = installFor(raw, source);
    const main = (raw.files ?? []).find((f) => /\.(tsx|jsx|html|ts)$/.test(f.path)) ?? raw.files?.[0];
    const previewSlug = previewSlugFor(raw);
    perSource[sourceId] = (perSource[sourceId] ?? 0) + 1;
    index.push({
      slug: slugOf(raw),
      title: raw.title || titleCase(raw.name),
      description: raw.description || '',
      category: categorize(raw),
      tags: raw.tags ?? [],
      library: source?.name ?? titleCase(sourceId),
      libraryId: sourceId,
      license: raw.license ?? 'unknown',
      author: cleanAuthor(raw.author ?? null),
      sourceUrl: raw.sourceUrl,
      docsUrl: raw.docsUrl ?? raw.sourceUrl,
      previewImage: imageSet.has(previewSlug) ? `previews/${previewSlug}.png` : null,
      ...install,
      dependencies: raw.dependencies ?? [],
      // Registry sources install from their own URL, so the code stays upstream. Copy-only
      // sources (GitHub repos, HTML snippets) ship the main file: it is the deliverable there.
      code: install.installKind === 'copy' && main ? main.content.slice(0, 20_000) : null,
      codePath: main?.path ?? null,
    });
  }
}
index.sort((a, b) => a.title.localeCompare(b.title));
writeFileSync(join(publicDataDir, 'index.json'), JSON.stringify({ generatedAt: new Date().toISOString(), components: index }));

// ---------------------------------------------------------------------------------------------
// libraries.json — every site the registry knows about, with a direct link.
// ---------------------------------------------------------------------------------------------
const libraries = sources
  .filter((s) => s.id && s.name && s.homepage && !String(s.homepage).includes('example.invalid'))
  .map((s) => ({
    id: s.id,
    name: s.name,
    kind: s.kind ?? 'shadcn-registry',
    status: s.status ?? 'pending',
    homepage: s.homepage,
    github: s.github ?? null,
    license: s.license ?? 'unknown',
    installs: s.kind === 'shadcn-registry' ? 'shadcn' : s.kind === 'npm-package' ? 'npm' : 'copy',
    indexed: perSource[s.id] ?? 0,
  }))
  .sort((a, b) => b.indexed - a.indexed || a.name.localeCompare(b.name));
writeFileSync(join(dataDir, 'libraries.json'), JSON.stringify(libraries, null, 2));

const bytes = statSync(join(publicDataDir, 'index.json')).size;
console.log(
  `[sync-registry] indexed ${index.length} components from ${Object.keys(perSource).length} libraries ` +
    `(${index.filter((c) => c.installCommand).length} with an install command); ${libraries.length} libraries listed; ` +
    `${images.length} preview images; index ${(bytes / 1048576).toFixed(1)} MB`
);

/** "Name <email>" becomes "Name"; nobody needs the address on a card. */
function cleanAuthor(a) {
  return typeof a === 'string' ? a.replace(/\s*<[^>]*>\s*/g, ' ').trim() || null : a ?? null;
}
