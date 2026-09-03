#!/usr/bin/env node
/**
 * Install shadcn registry items into this app without the shadcn CLI (this is a Vite app with
 * CSS modules; the CLI expects a Next/Tailwind layout it can rewrite).
 *
 *   node scripts/install-registry-item.mjs https://dotmatrix.zzzzshawn.cloud/r/dotm-square-1.json ...
 *   node scripts/install-registry-item.mjs button dialog        # bare names resolve to ui.shadcn.com
 *
 * Files land under src/ by their registry path (`components/ui/x.tsx` -> `src/components/ui/x.tsx`;
 * shadcn's `registry/<style>/ui/x.tsx` is mapped by type to `components/ui/x.tsx`, `lib/x.ts`,
 * `hooks/x.ts`), imports stay `@/…` (the app resolves `@` to `src`), and a CREDITS line is appended
 * to src/components/ui/REGISTRY-CREDITS.md so the source of every installed file is recorded.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SHADCN = 'https://ui.shadcn.com/r/styles/new-york-v4';
/** Namespaced registry dependencies (`@scope/name`) resolve through this map; bare names are shadcn. */
const NAMESPACES = {
  '@spectrumui/': 'https://ui.spectrumhq.in/r/',
  '@ai-elements/': 'https://registry.ai-sdk.dev/',
};
const toUrl = (u) => {
  if (/^https?:/.test(u)) return u;
  for (const [prefix, base] of Object.entries(NAMESPACES)) {
    if (u.startsWith(prefix)) return `${base}${u.slice(prefix.length)}.json`;
  }
  return `${SHADCN}/${u}.json`;
};
const urls = process.argv.slice(2).filter((u) => u && !u.startsWith('-')).map(toUrl);
if (urls.length === 0) {
  console.error('usage: node scripts/install-registry-item.mjs <registry item url> [...]');
  process.exit(1);
}

const seen = new Set();
const written = [];
const creditsPath = join(app, 'src', 'components', 'ui', 'REGISTRY-CREDITS.md');
const credits = existsSync(creditsPath) ? readFileSync(creditsPath, 'utf8') : '# Registry credits\n\nFiles under src/components/ui installed from public registries.\n\n';
let creditLines = '';

/** shadcn's raw items carry CLI placeholders (`from "cn"`, `@/registry/<style>/ui/x`); point them at this app. */
function rewriteImports(content) {
  return content
    .replace(/from ["']cn["']/g, 'from "@/lib/utils"')
    .replace(/@\/registry\/[a-z0-9-]+\/ui\//g, '@/components/ui/')
    .replace(/@\/registry\/[a-z0-9-]+\/lib\//g, '@/lib/')
    .replace(/@\/registry\/[a-z0-9-]+\/hooks\//g, '@/hooks/');
}

/** Where a registry file lands under src/. */
function targetFor(f) {
  if (f.target) return f.target.replace(/^\.?\/?(src\/)?/, '');
  const name = f.path.split('/').pop();
  if (/^registry\//.test(f.path)) {
    if (f.type === 'registry:lib') return `lib/${name}`;
    if (f.type === 'registry:hook') return `hooks/${name}`;
    if (f.type === 'registry:ui' || f.type === 'registry:component') return `components/ui/${name}`;
  }
  return f.path.replace(/^\.?\/?(src\/)?/, '');
}

async function install(url) {
  if (seen.has(url)) return;
  seen.add(url);
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  const item = await res.json();
  for (const f of item.files ?? []) {
    if (typeof f.content !== 'string') continue;
    const rel = targetFor(f);
    const target = join(app, 'src', rel);
    const content = rewriteImports(f.content);
    mkdirSync(dirname(target), { recursive: true });
    if (!existsSync(target) || readFileSync(target, 'utf8') !== content) {
      writeFileSync(target, content);
      written.push(rel);
    }
  }
  creditLines += `- ${item.title ?? item.name} — ${url}\n`;
  // Registry dependencies are pulled too; bare names are shadcn primitives.
  for (const dep of item.registryDependencies ?? []) await install(toUrl(dep));
  if ((item.dependencies ?? []).length) console.log(`[${item.name}] npm dependencies: ${item.dependencies.join(' ')}`);
}

for (const u of urls) await install(u);
writeFileSync(creditsPath, credits + creditLines);
console.log(`installed ${seen.size} item(s); wrote ${written.length} file(s):\n  ${written.join('\n  ')}`);
