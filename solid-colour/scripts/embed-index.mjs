#!/usr/bin/env node
/**
 * Embeds every component in public/data/index.json with Gemini so search is semantic, not just
 * word matching. Run after `npm run sync`; wired into `npm run sync` itself when a key is present.
 *
 *   GEMINI_API_KEY=… node scripts/embed-index.mjs          # or put the key in .env
 *
 * Output: public/embeddings.bin — int8-quantised vectors, one row per component in index order —
 * and src/data/embeddings.json with the dimension, scale and the slug order. 256 dimensions keep
 * the whole catalogue under a megabyte, small enough to ship to the browser and search on device.
 * Vectors are cached by content hash in .cache/embeddings so a re-run only embeds what changed.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
loadDotenv(join(app, '.env'));

const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_EMBED_MODEL ?? 'gemini-embedding-001';
const DIM = Number(process.env.GEMINI_EMBED_DIM ?? 256);
const BATCH = Number(process.env.GEMINI_EMBED_BATCH ?? 50);

if (!KEY) {
  console.log('[embed-index] GEMINI_API_KEY not set — skipping (search stays keyword-only)');
  process.exit(0);
}

const index = JSON.parse(readFileSync(join(app, 'public', 'data', 'index.json'), 'utf8'));
const cacheDir = join(app, '.cache', 'embeddings');
mkdirSync(cacheDir, { recursive: true });

/** What the model sees for each component: the same text the query is matched against. */
export function documentText(c) {
  return [
    c.title,
    c.category.replace(/-/g, ' '),
    c.tags.join(', '),
    c.description,
    `from ${c.library}`,
    c.installKind === 'shadcn' ? 'installs with one shadcn command' : c.installKind === 'npm' ? 'npm package' : 'copy the code',
  ]
    .filter(Boolean)
    .join('. ');
}

async function embedBatch(texts) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:batchEmbedContents`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': KEY },
    body: JSON.stringify({
      requests: texts.map((text) => ({
        model: `models/${MODEL}`,
        content: { parts: [{ text }] },
        taskType: 'RETRIEVAL_DOCUMENT',
        outputDimensionality: DIM,
      })),
    }),
  });
  if (!res.ok) throw new Error(`embed ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return data.embeddings.map((e) => e.values);
}

function normalize(v) {
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / n);
}

const vectors = new Array(index.components.length);
const todo = [];
for (let i = 0; i < index.components.length; i++) {
  const text = documentText(index.components[i]);
  const hash = createHash('sha1').update(`${MODEL}:${DIM}:${text}`).digest('hex');
  const cached = join(cacheDir, `${hash}.json`);
  if (existsSync(cached)) vectors[i] = JSON.parse(readFileSync(cached, 'utf8'));
  else todo.push({ i, text, cached });
}
console.log(`[embed-index] ${index.components.length} components, ${todo.length} to embed, ${index.components.length - todo.length} cached`);

for (let b = 0; b < todo.length; b += BATCH) {
  const slice = todo.slice(b, b + BATCH);
  let vecs;
  for (let attempt = 1; ; attempt++) {
    try {
      vecs = await embedBatch(slice.map((t) => t.text));
      break;
    } catch (err) {
      // Free-tier quotas are per minute: a 429 means wait out the window, not give up.
      const quota = /429/.test(err.message);
      const network = /fetch failed|timeout|ECONN|ENOTFOUND|503/i.test(String(err.cause ?? err.message));
      if (attempt >= (quota ? 40 : network ? 30 : 5)) throw err;
      const wait = quota ? 61_000 : network ? 20_000 : 1500 * attempt;
      console.log(`\n[embed-index] ${quota ? 'quota window' : 'retry'} ${attempt}: waiting ${Math.round(wait / 1000)}s — ${err.message.replace(/\s+/g, ' ').slice(0, 160)}`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  // Pace well under the per-minute quota so retries are the exception.
  if (b + BATCH < todo.length) await new Promise((r) => setTimeout(r, Number(process.env.GEMINI_EMBED_PAUSE_MS ?? 15_000)));
  slice.forEach((t, j) => {
    const v = normalize(vecs[j]);
    vectors[t.i] = v;
    writeFileSync(t.cached, JSON.stringify(v));
  });
  process.stdout.write(`\r[embed-index] ${Math.min(b + BATCH, todo.length)}/${todo.length}`);
}
if (todo.length) process.stdout.write('\n');

// int8 quantisation: unit vectors have components in [-1, 1]; scale by 127.
const bin = new Int8Array(vectors.length * DIM);
for (let i = 0; i < vectors.length; i++) for (let d = 0; d < DIM; d++) bin[i * DIM + d] = Math.max(-127, Math.min(127, Math.round(vectors[i][d] * 127)));
mkdirSync(join(app, 'public'), { recursive: true });
writeFileSync(join(app, 'public', 'embeddings.bin'), Buffer.from(bin.buffer));
writeFileSync(
  join(app, 'src', 'data', 'embeddings.json'),
  JSON.stringify({ model: MODEL, dim: DIM, scale: 127, count: vectors.length, slugs: index.components.map((c) => c.slug) })
);
console.log(`[embed-index] wrote public/embeddings.bin (${(bin.byteLength / 1024).toFixed(0)} KB) for ${vectors.length} components at ${DIM} dims`);

function loadDotenv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
