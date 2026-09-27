#!/usr/bin/env node
/**
 * Run the finder from the terminal against the live web, through Vite's module loader (the same
 * path the dev server uses):
 *
 *   node --env-file=.env scripts/try-find.mjs "footer designs" [any|components|library|inspiration] [count]
 */
import { createServer } from 'vite';

const [query = 'footer designs', type = 'any', count = '6'] = process.argv.slice(2);
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const { find } = await vite.ssrLoadModule('/server/find.ts');
const t0 = Date.now();
const at = () => `${((Date.now() - t0) / 1000).toFixed(1)}s`.padStart(6);
await find({ query, type, count: Number(count) }, (e) => {
  if (e.type === 'stage') console.log(`${at()}  ▸ ${e.label}`);
  else if (e.type === 'sources') {
    console.log(`${at()}    searched: ${e.queries.join(' | ')}`);
    for (const s of e.items) console.log(`           · ${s.title}  ${s.url}`);
  } else if (e.type === 'result') {
    const s = e.site;
    console.log(`\n${at()}  ${s.rank}. ${s.name} [${s.origin}${s.paid ? ', paid' : ''}]  ${s.url}`);
    console.log(`         why: ${s.why}`);
    console.log(`         look for: ${s.lookFor}`);
    console.log(`         evidence: ${s.evidence.map((x) => x.url).join(', ') || '—'}`);
    console.log(`         image: ${s.image ?? '—'}`);
  } else console.log(`${at()}  ${e.type}: ${JSON.stringify(e).slice(0, 400)}`);
});
await vite.close();
