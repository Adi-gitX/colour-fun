#!/usr/bin/env node
/**
 * build-registry-snapshot.mjs
 *
 * Reads the Atlas registry raw artifacts (a sibling, read-only repo) and emits a
 * single flattened JSON snapshot the app can import at build time.
 *
 *   INPUT   $ATLAS_RAW_DIR (default: ~/atlas-registry/data/raw)/<source>/*.json
 *   OUTPUT  src/data/registry-snapshot.json
 *   ALSO    copies $ATLAS_PREVIEWS_DIR (default: <raw>/../previews) into
 *           public/previews, skipping silently when absent or empty.
 *
 * The `_cache/` and `_repos/` working directories under the raw root are skipped.
 * If the input root does not exist the script exits 0 without touching an existing
 * snapshot, so the repo stays buildable on a machine without the sibling repo.
 *
 * Pure Node ESM, no dependencies. Importing this module has no side effects, so
 * unit tests can import { categorize, kebabCase, titleCase, SOURCE_NAMES }.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DEFAULT_RAW_DIR = path.join(os.homedir(), 'atlas-registry', 'data', 'raw');
const RAW_DIR = process.env.ATLAS_RAW_DIR || DEFAULT_RAW_DIR;

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const OUT_FILE = path.join(REPO_ROOT, 'src', 'data', 'registry-snapshot.json');

/** Directories under the raw root that are working state, not artifacts. */
const SKIP_DIRS = new Set(['_cache', '_repos']);

/** Prerendered preview bundles produced by the atlas-registry verify stage. */
const PREVIEWS_DIR =
  process.env.ATLAS_PREVIEWS_DIR || path.resolve(RAW_DIR, '..', 'previews');
const PREVIEWS_OUT = path.join(REPO_ROOT, 'public', 'previews');

/** Hard ceiling for the emitted snapshot. */
const MAX_BYTES = 4 * 1024 * 1024;

// ---------------------------------------------------------------------------
// Named exports (imported by the app's unit tests)
// ---------------------------------------------------------------------------

/** Human labels for each registry source id. */
export const SOURCE_NAMES = {
  'aceternity': 'Aceternity UI',
  'animate-ui': 'Animate UI',
  'kibo-ui': 'Kibo UI',
  'kokonutui': 'Kokonut UI',
  'magicui': 'Magic UI',
  'react-bits': 'React Bits',
  'shadcn': 'shadcn/ui',
  'threeui': 'ThreeUI',
  'gsap': 'GSAP',
  'hyperui': 'HyperUI',
};

/** The closed set of categories `categorize` can return. */
export const CATEGORIES = [
  'button',
  'card',
  'hero',
  'navbar',
  'pricing',
  'form',
  'input',
  'text-effect',
  'background',
  'loader',
  'layout',
  'data-display',
  'feedback',
  'navigation',
  'overlay',
  'media',
  '3d',
  'animation',
  'other',
];

/**
 * Split camelCase / PascalCase boundaries, then lowercase and collapse every run
 * of non-alphanumerics into a single dash.
 *
 * kebabCase('AnimatedContent-TS-TW') === 'animated-content-ts-tw'
 * kebabCase('@gsap/react')           === 'gsap-react'
 *
 * @param {string} input
 * @returns {string}
 */
export function kebabCase(input) {
  return splitCamel(String(input ?? ''))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Title-case an identifier: camelCase boundaries are split, separators become
 * spaces, and each word is capitalised.
 *
 * titleCase('animated-top-dock') === 'Animated Top Dock'
 * titleCase('button-groups')     === 'Button Groups'
 *
 * @param {string} input
 * @returns {string}
 */
export function titleCase(input) {
  return splitCamel(String(input ?? ''))
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Insert separators at camelCase / PascalCase boundaries. */
function splitCamel(s) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2');
}

/**
 * Ordered, most-specific-first keyword rules. The first match wins, so e.g.
 * `pricing` is tested before `card` and `navbar` before `navigation`.
 * @type {Array<[string, RegExp]>}
 */
const CATEGORY_RULES = [
  ['pricing', /\bpricing\b|\bprice\b|price-table|\bplan-|\bplans\b|\btier\b|\bsubscription\b/],
  ['hero', /\bhero\b|\bcta\b|call-to-action|landing-page|landing-pages/],
  ['navbar', /\bnavbar\b|nav-bar|menubar|\bsidebar\b|navigation-menu|\bheader\b|\btoolbar\b|\bdock\b/],
  ['overlay', /\bdialog\b|\bmodal\b|popover|\bdrawer\b|\bsheet\b|tooltip|dropdown|context-menu|hover-card|\bportal\b|lightbox/],
  ['loader', /\bloader\b|\bloading\b|spinner|skeleton|\bprogress\b|\bshimmer\b|placeholder/],
  ['button', /\bbutton\b|\bbuttons\b|button-group|button-groups|\bbtn\b|\btoggle\b/],
  ['form', /\bform\b|\bfield\b|\blabel\b|checkbox|\bradio\b|\bswitch\b|\bselect\b|combobox|choicebox|\bupload\b|attachment/],
  ['input', /\binput\b|textarea|\botp\b|\bslider\b|calendar|date-picker|color-picker|search-bar|\bsearch\b|\bkbd\b|\bcommand\b|\bprompt\b/],
  ['text-effect', /\btext\b|typograph|\btype\b|typing|\bfont\b|\bword\b|\bletter\b|marquee|\bheading\b|headings|\btitle\b/],
  ['background', /background|\bbeam\b|\bbeams\b|gradient|\bpattern\b|particle|particles|\bmeteor\b|meteors|\bstars\b|\bnoise\b|\bwarp\b|spotlight|\baurora\b|\bgrid\b|\bglow\b|\bfield\b/],
  ['media', /\bimage\b|\bvideo\b|carousel|gallery|\bavatar\b|\blens\b|aspect-ratio|comparison|\bmockup\b|\bandroid\b|\biphone\b|\bdevice\b/],
  ['data-display', /\bchart\b|charts|\btable\b|\bgraph\b|\bbadge\b|badges|\bstat\b|contribution|\bcode\b|code-block|\blist\b|\btree\b|\btimeline\b|\bcurrency\b|\btransfer\b/],
  ['feedback', /\balert\b|\btoast\b|sonner|\bempty\b|\bmessage\b|announcement|\bbanner\b|notification/],
  ['navigation', /breadcrumb|breadcrumbs|pagination|\btabs\b|\btab\b|\bmenu\b|navigation|\blink\b|\bstepper\b/],
  ['card', /\bcard\b|\bcards\b|\bitem\b|\btile\b|\bpanel\b/],
  ['animation', /\banimat\w*|\bmotion\b|\bgsap\b|transition|\bscroll\b|\beffect\b|\bcursor\b|\bpointer\b|\bspark\b|\bhover\b|\bblur\b|\breveal\b|\bmask\b|\bflip\b|\bmorph\w*|\bsparkles\b|\bfade\b/],
  ['layout', /\blayout\b|\bcontainer\b|\bsection\b|separator|resizable|scroll-area|accordion|accordions|collapsible|\bgroup\b|\bgrid\b|\bstack\b|\bdivider\b|\bspacer\b/],
];

/**
 * Classify one raw artifact into exactly one category from CATEGORIES.
 *
 * @param {{source?: string, sourceKind?: string, name?: string, title?: string,
 *          tags?: string[], categories?: string[], description?: string}} artifact
 * @returns {string} one of CATEGORIES
 */
export function categorize(artifact) {
  const a = artifact || {};

  // The ThreeUI repo is entirely WebGL/Three.js shader work.
  if (a.source === 'threeui') return '3d';

  const haystack = [
    a.name,
    a.title,
    ...(Array.isArray(a.tags) ? a.tags : []),
    ...(Array.isArray(a.categories) ? a.categories : []),
    a.description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    // Re-introduce dashes for the hyphenated tokens the rules look for.
    .trim();

  // Match against both the space-joined form and a dash-joined form so rules can
  // use either `\bbutton\b` or `button-group`.
  const dashed = haystack.replace(/ /g, '-');

  for (const [category, re] of CATEGORY_RULES) {
    if (re.test(haystack) || re.test(dashed)) return category;
  }
  return 'other';
}

// ---------------------------------------------------------------------------
// Snapshot building
// ---------------------------------------------------------------------------

/** Noun used in derived descriptions, keyed by sourceKind. */
const KIND_NOUNS = {
  'shadcn-registry': 'registry component',
  'github-repo': 'component',
  'html-snippets': 'snippet',
  'npm-package': 'package',
};

/** ThreeUI is a shader repo; say so rather than the generic noun. */
const SOURCE_KIND_NOUNS = {
  threeui: 'Three.js shader component',
};

/** Crude singulariser, only used for HyperUI group nouns (accordions -> accordion). */
function singularize(word) {
  if (/(ss|us|is)$/.test(word)) return word;
  if (/ies$/.test(word)) return word.replace(/ies$/, 'y');
  if (/s$/.test(word)) return word.slice(0, -1);
  return word;
}

/**
 * HyperUI names look like `application-accordions-1` / `marketing-banners-3`.
 * The group is everything between the leading section and the trailing index.
 */
function hyperuiGroup(name) {
  const parts = String(name || '').split('-').filter(Boolean);
  if (parts.length < 2) return String(name || '');
  const body = parts.slice(1);
  if (/^\d+$/.test(body[body.length - 1])) body.pop();
  return body.length ? body.join('-') : parts.join('-');
}

function buildTitle(artifact) {
  const name = artifact.name || '';
  const raw = typeof artifact.title === 'string' ? artifact.title.trim() : '';

  if (artifact.source === 'hyperui') {
    // HyperUI titles are per-variant headings ("Base", "Base (Dark)") and are not
    // unique, so qualify them with the component group.
    const heading = raw || (artifact.extra && artifact.extra.heading) || titleCase(name);
    return `${titleCase(hyperuiGroup(name))} — ${heading}`;
  }

  // Several sources (threeui, kibo-ui, gsap) set `title` to the raw slug-ish name.
  // Title-case those rather than surfacing `animated-top-dock` as a display title.
  if (!raw || raw === name) return titleCase(name);
  return raw;
}

function buildDescription(artifact, sourceName) {
  const raw = typeof artifact.description === 'string' ? artifact.description.trim() : '';
  if (raw) return raw;

  if (artifact.source === 'hyperui') {
    const group = hyperuiGroup(artifact.name).split('-').map(singularize).join(' ');
    return `Tailwind CSS ${group} markup from HyperUI.`;
  }

  const noun =
    SOURCE_KIND_NOUNS[artifact.source] || KIND_NOUNS[artifact.sourceKind] || 'component';
  return `${titleCase(artifact.name)} — ${sourceName} ${noun}.`;
}

function mapFiles(list) {
  if (!Array.isArray(list)) return [];
  return list.map((f) => ({
    path: f.path || f.target || '',
    content: typeof f.content === 'string' ? f.content : '',
    type: f.type || '',
  }));
}

function toComponent(artifact) {
  const source = artifact.source || '';
  const sourceName = SOURCE_NAMES[source] || titleCase(source);
  return {
    slug: kebabCase(`${source}-${artifact.name}`),
    title: buildTitle(artifact),
    description: buildDescription(artifact, sourceName),
    category: categorize(artifact),
    tags: Array.isArray(artifact.tags) ? artifact.tags : [],
    source,
    sourceName,
    author: artifact.author != null && artifact.author !== '' ? artifact.author : null,
    license: artifact.license || null,
    sourceUrl: artifact.sourceUrl || null,
    dependencies: Array.isArray(artifact.dependencies) ? artifact.dependencies : [],
    registryDependencies: Array.isArray(artifact.registryDependencies)
      ? artifact.registryDependencies
      : [],
    files: mapFiles(artifact.files),
    demoFiles: mapFiles(artifact.demoFiles),
  };
}

/** Recursively collect artifact JSON paths, skipping _cache/ and _repos/. */
function collectArtifactPaths(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      out.push(...collectArtifactPaths(path.join(dir, entry.name)));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

/**
 * Plan the preview copy: every file inside a `{slug}/` bundle directory plus any
 * top-level `{slug}.png`. Returns an empty plan when the source is missing or has
 * nothing to copy, so the caller can skip without creating any directories.
 *
 * @returns {{copies: Array<{from: string, to: string}>, bundles: number, pngs: number}}
 */
function planPreviewCopies() {
  const empty = { copies: [], bundles: 0, pngs: 0 };
  if (!fs.existsSync(PREVIEWS_DIR) || !fs.statSync(PREVIEWS_DIR).isDirectory()) return empty;

  let entries;
  try {
    entries = fs.readdirSync(PREVIEWS_DIR, { withFileTypes: true });
  } catch {
    return empty;
  }

  const copies = [];
  let bundles = 0;
  let pngs = 0;

  const walk = (fromDir, toDir) => {
    for (const e of fs.readdirSync(fromDir, { withFileTypes: true })) {
      const from = path.join(fromDir, e.name);
      const to = path.join(toDir, e.name);
      if (e.isDirectory()) walk(from, to);
      else if (e.isFile()) copies.push({ from, to });
    }
  };

  for (const entry of entries) {
    const from = path.join(PREVIEWS_DIR, entry.name);
    if (entry.isDirectory()) {
      const before = copies.length;
      walk(from, path.join(PREVIEWS_OUT, entry.name));
      if (copies.length > before) bundles += 1;
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      copies.push({ from, to: path.join(PREVIEWS_OUT, entry.name) });
      pngs += 1;
    }
  }

  return { copies, bundles, pngs };
}

/**
 * Copy prerendered previews into public/previews, preserving the
 * `{slug}/preview.{html,js,css}` layout and any top-level `{slug}.png`.
 *
 * The verify stage that produces these is optional, so an absent or empty source
 * is a silent skip that creates nothing. Nothing already under public/ is removed.
 */
function copyPreviews() {
  const { copies, bundles, pngs } = planPreviewCopies();

  if (copies.length === 0) {
    console.log(`[registry-snapshot] previews: none found at ${PREVIEWS_DIR}, skipping`);
    return;
  }

  for (const { from, to } of copies) {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }

  console.log(
    `[registry-snapshot] previews: copied ${bundles} bundle${bundles === 1 ? '' : 's'} ` +
      `and ${pngs} PNG${pngs === 1 ? '' : 's'} (${copies.length} files) -> ${PREVIEWS_OUT}`
  );
}

function main() {
  if (!fs.existsSync(RAW_DIR) || !fs.statSync(RAW_DIR).isDirectory()) {
    console.log(
      `[registry-snapshot] input dir not found: ${RAW_DIR}\n` +
        `[registry-snapshot] set ATLAS_RAW_DIR to override. Leaving ` +
        `${path.relative(REPO_ROOT, OUT_FILE)} untouched and exiting 0.`
    );
    process.exit(0);
  }

  const files = collectArtifactPaths(RAW_DIR).sort();
  const components = [];
  const seen = new Map();

  for (const file of files) {
    let artifact;
    try {
      artifact = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
      throw new Error(`Failed to parse ${file}: ${err.message}`);
    }
    if (!artifact || !artifact.name || !artifact.source) {
      throw new Error(`Artifact missing name/source: ${file}`);
    }

    const component = toComponent(artifact);
    if (seen.has(component.slug)) {
      throw new Error(
        `Slug collision "${component.slug}": ${seen.get(component.slug)} vs ${file}`
      );
    }
    seen.set(component.slug, file);
    components.push(component);
  }

  components.sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));

  const snapshot = { generatedAt: new Date().toISOString(), components };

  // Size guard: if the payload blows past the ceiling, keep only the main file's
  // content for each component.
  let trimmed = false;
  if (Buffer.byteLength(JSON.stringify(snapshot), 'utf8') > MAX_BYTES) {
    for (const c of snapshot.components) {
      c.files = c.files.map((f, i) => (i === 0 ? f : { ...f, content: '' }));
      c.demoFiles = c.demoFiles.map((f, i) => (i === 0 ? f : { ...f, content: '' }));
    }
    trimmed = true;
    console.log(
      '[registry-snapshot] snapshot exceeded 4 MB: dropped `content` for every ' +
        'file except the first of each component.'
    );
  }

  let json = JSON.stringify(snapshot, null, 2);
  if (Buffer.byteLength(json, 'utf8') > MAX_BYTES) {
    json = JSON.stringify(snapshot);
    console.log('[registry-snapshot] pretty output exceeded 4 MB: writing compact JSON.');
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, json + '\n', 'utf8');

  copyPreviews();

  // ---- summary ----
  const bySource = {};
  const byCategory = {};
  for (const c of snapshot.components) {
    bySource[c.source] = (bySource[c.source] || 0) + 1;
    byCategory[c.category] = (byCategory[c.category] || 0) + 1;
  }
  const bytes = Buffer.byteLength(json + '\n', 'utf8');

  console.log(`[registry-snapshot] input:  ${RAW_DIR}`);
  console.log(`[registry-snapshot] output: ${OUT_FILE}`);
  console.log(`[registry-snapshot] components: ${snapshot.components.length}`);
  console.log('[registry-snapshot] per source:');
  for (const [k, v] of Object.entries(bySource).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
    console.log(`    ${k.padEnd(12)} ${v}`);
  }
  console.log('[registry-snapshot] per category:');
  for (const [k, v] of Object.entries(byCategory).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
    console.log(`    ${k.padEnd(14)} ${v}`);
  }
  console.log(
    `[registry-snapshot] bytes: ${bytes} (${(bytes / 1024 / 1024).toFixed(2)} MB)` +
      (trimmed ? ' [content trimmed]' : '')
  );
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) main();
