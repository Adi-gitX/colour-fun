#!/usr/bin/env node
/**
 * One-off import of Garden's curated site list from the atlas-registry manifest.
 *
 *   node scripts/import-sites.mjs [path/to/sources.yaml]
 *
 * Writes src/data/sites.json: the sites Garden recommends from. It is a hand-picked list of
 * websites (name, homepage, what kind of site it is), not an index of their contents: every
 * question is answered live from the web. Edit sites.json directly from here on.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const yaml = require('js-yaml');
const here = dirname(fileURLToPath(import.meta.url));
const manifest = process.argv[2] ?? join(here, '../../../atlas-registry/sources/sources.yaml');

/** Names the manifest picked up from page titles or challenge pages. */
const NAMES = {
  saaspo: 'Saaspo',
  uxsnaps: 'UX Snaps',
  motionsites: 'Motion Sites',
  layers: 'Layers',
  miromiro: 'Miromiro',
  dark: 'Dark Design',
  'before-click': 'before.click',
  'torph-lochie': 'Torph',
  footer: 'Footer Design',
  bui: 'BUI',
  'glass3d': 'Glass3D',
  'websiteprompts-ai': 'Website Prompts',
};

/** Sites that no longer serve anything worth sending someone to. */
const DROP = new Set(['jollyui']);

const TYPE = {
  'shadcn-registry': 'components',
  'github-repo': 'components',
  'html-snippets': 'components',
  'npm-package': 'library',
  inspiration: 'inspiration',
};

const { sources } = yaml.load(readFileSync(manifest, 'utf8'));
const sites = sources
  .filter((s) => !DROP.has(s.id))
  .map((s) => ({
    id: s.id,
    name: NAMES[s.id] ?? s.name,
    url: s.homepage.replace(/\/$/, ''),
    type: TYPE[s.kind] ?? 'components',
    ...(s.github ? { github: s.github } : {}),
    ...(s.status === 'paid' || s.id === 'reui' ? { paid: true } : {}),
  }));

const out = join(here, '../src/data/sites.json');
writeFileSync(out, JSON.stringify(sites, null, 2) + '\n');
const byType = sites.reduce((m, s) => ({ ...m, [s.type]: (m[s.type] ?? 0) + 1 }), {});
console.log(`wrote ${sites.length} sites to ${out}`, byType);
