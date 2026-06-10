#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cat = JSON.parse(readFileSync(join(root, 'games/catalog.json'), 'utf8'));
const paths = [
  '/', '/index.html', '/style.css', '/script.js', '/js/perf.js', '/js/scene.js',
  '/games/', '/games/index.html', '/games/games.css', '/games/shared.css', '/games/game-skins.css', '/games/game-ui.js',
  '/games/catalog.json',
  '/404.html', '/Images/logo.png', '/Images/og-image.png', '/Images/wordle-game.jpg',
  '/Images/wordle-game.webp', '/Images/TDEC-company.webp', '/Images/calculator.webp', '/Images/todo.webp',
];
for (const g of cat) {
  paths.push(`/games/${g.slug}.html`);
  paths.push(g.slug === 'tower' ? '/games/tower-game.js' : `/games/${g.slug}.js`);
}
let sw = readFileSync(join(root, 'sw.js'), 'utf8');
const verMatch = sw.match(/const CACHE_VERSION\s*=\s*'v(\d+)'/);
const nextVer = verMatch ? `v${Number(verMatch[1]) + 1}` : 'v12';
sw = sw.replace(/const CACHE_VERSION\s*=\s*'[^']+'/, `const CACHE_VERSION  = '${nextVer}'`);
sw = sw.replace(
  /const PRECACHE_STATIC = \[[\s\S]*?\];/,
  `const PRECACHE_STATIC = ${JSON.stringify(paths, null, 2)};`
);
writeFileSync(join(root, 'sw.js'), sw);
console.log('sw.js updated:', nextVer, paths.length, 'paths');
