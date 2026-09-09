#!/usr/bin/env node
/**
 * Draws the app icons and the README wordmark from the same 5×5 dot matrix as the in-app mark, so
 * the favicon, the PWA icons, the docs banner and src/components/brand/DotMark.tsx cannot drift.
 *
 *   node scripts/gen-icons.mjs
 *
 * Writes public/favicon.svg (64), public/pwa-192x192.svg, public/pwa-512x512.svg and the two
 * .github/assets wordmarks. The wordmark is drawn as dots rather than text so it needs no font
 * and renders identically on every platform. Change GLYPH (and DotMark.tsx) to change the letter.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Garden: the letter G lit in a 5×5 grid. Keep in sync with DotMark.tsx. */
const GLYPH = [
  [0, 1, 1, 1, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 1, 1, 0],
  [1, 0, 0, 1, 0],
  [0, 1, 1, 1, 0],
];

// Ratios taken from the original icons so the new ones sit identically in a browser tab.
const FIRST = 0.2440625; // centre of the first dot
const STEP = 0.12796875; // centre-to-centre spacing
const RADIUS = 0.0435938;
const CORNER = 0.2203125;

const BG = '#000000';
const EDGE = '#27272a';
const DOT = '#fafafa';
const OFF_OPACITY = 0.14;

function icon(size) {
  const n = (v) => Number(v.toFixed(2));
  const rx = n(size * CORNER);
  const r = n(size * RADIUS);
  const dots = GLYPH.flatMap((row, y) =>
    row.map((on, x) => {
      const cx = n(size * (FIRST + x * STEP));
      const cy = n(size * (FIRST + y * STEP));
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${DOT}" opacity="${on ? 1 : OFF_OPACITY}"/>`;
    })
  );
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">` +
    `<rect width="${size}" height="${size}" rx="${rx}" fill="${BG}"/>` +
    `<rect x="0.5" y="0.5" width="${size - 1}" height="${size - 1}" rx="${rx}" fill="none" stroke="${EDGE}"/>` +
    dots.join('') +
    `</svg>\n`
  );
}

for (const [name, size] of [
  ['favicon.svg', 64],
  ['pwa-192x192.svg', 192],
  ['pwa-512x512.svg', 512],
]) {
  const file = join(app, 'public', name);
  writeFileSync(file, icon(size));
  console.log(`[gen-icons] ${name} (${size}px)`);
}

/* ---------------------------------------------------------------- README wordmark ---------- */

/** A 5×5 dot font, only the letters the wordmark needs. */
const LETTERS = {
  G: ['.###.', '#....', '#.##.', '#..#.', '.###.'],
  A: ['.###.', '#...#', '#####', '#...#', '#...#'],
  R: ['####.', '#...#', '####.', '#..#.', '#...#'],
  D: ['####.', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '###..', '#....', '#####'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#'],
};

const CELL = 14;
const DOT_R = 3.4; // well under half a cell, so letters stay open rather than blurring into blocks
const LETTER_GAP = 2; // in cells; one is not enough to separate adjacent letters
const PAD = 18;

function wordmark(word, color) {
  const cols = word.length * 5 + (word.length - 1) * LETTER_GAP;
  const w = cols * CELL + PAD * 2;
  const h = 5 * CELL + PAD * 2;
  const dots = [];
  word.split('').forEach((ch, i) => {
    const rows = LETTERS[ch];
    if (!rows) throw new Error(`no glyph for ${ch}`);
    const originCol = i * (5 + LETTER_GAP);
    rows.forEach((row, y) =>
      row.split('').forEach((c, x) => {
        const cx = PAD + (originCol + x) * CELL + CELL / 2;
        const cy = PAD + y * CELL + CELL / 2;
        if (c !== '#') return;
        dots.push(`<circle cx="${cx}" cy="${cy}" r="${DOT_R}" fill="${color}"/>`);
      })
    );
  });
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${word}">` +
    dots.join('') +
    `</svg>\n`
  );
}

// The README these illustrate lives at the repository root, one level above the app.
const assets = resolve(app, '..', '.github', 'assets');
mkdirSync(assets, { recursive: true });
for (const [name, color] of [
  ['wordmark-dark.svg', '#fafafa'],
  ['wordmark-light.svg', '#16161a'],
]) {
  writeFileSync(join(assets, name), wordmark('GARDEN', color));
  console.log(`[gen-icons] ../.github/assets/${name}`);
}
