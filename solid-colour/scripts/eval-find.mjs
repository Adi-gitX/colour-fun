#!/usr/bin/env node
/**
 * Quality check for the finder against the live web.
 *
 *   node --env-file=.env scripts/eval-find.mjs [query …]
 *
 * For each request: how many sites came back, how many land on the exact section rather than a
 * homepage, how many came from Garden's list, and how long it took. Every returned link has
 * already been opened by the pipeline, so dead links cannot appear here.
 */
import { createServer } from 'vite';

const QUERIES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      'footer designs',
      'hero section inspiration',
      'pricing page with monthly and yearly toggle',
      'animated text effects',
      'dashboard sidebar',
      'login and signup forms',
      'bento grid layouts',
      '404 pages',
    ];

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const { find } = await vite.ssrLoadModule('/server/find.ts');

const rows = [];
for (const query of QUERIES) {
  const t0 = Date.now();
  const results = [];
  let sources = 0;
  const problems = [];
  await find({ query, count: 6 }, (e) => {
    if (e.type === 'result') results.push(e.site);
    if (e.type === 'sources') sources = e.items.length;
    if (e.type === 'error' || e.type === 'note') problems.push(e.message ?? e.text);
  });
  const specific = results.filter((r) => new URL(r.url).pathname.replace(/\/$/, '') !== '').length;
  const dedicated = results.filter((r) => /gallery|design|supply|footer|navbar|hero|section/.test(r.domain)).length;
  rows.push({
    query,
    results: results.length,
    'section page': `${specific}/${results.length}`,
    'from list': results.filter((r) => r.origin === 'garden').length,
    sources,
    seconds: Math.round((Date.now() - t0) / 1000),
    problems: problems.join(' | ').slice(0, 60),
  });
  console.log(`${query}\n${results.map((r) => `   ${r.rank}. ${r.name.padEnd(22)} ${r.url}`).join('\n')}\n`);
  void dedicated;
}
console.table(rows);
const total = rows.reduce((n, r) => n + r.results, 0);
const spec = rows.reduce((n, r) => n + Number(r['section page'].split('/')[0]), 0);
const secs = rows.map((r) => r.seconds).sort((a, b) => a - b);
console.log(`sites ${total} · on a section page ${Math.round((100 * spec) / Math.max(total, 1))}% · median ${secs[Math.floor(secs.length / 2)]}s · max ${secs.at(-1)}s`);
await vite.close();
