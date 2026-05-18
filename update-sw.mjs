#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cat = JSON.parse(readFileSync(join(root, 'games/catalog.json'), 'utf8'));
const paths = [
  '/', '/index.html', '/style.css', '/script.js', '/js/perf.js', '/js/scene.js',
  '/games/', '/games/index.html', '/games/games.css', '/games/shared.css', '/games/game-ui.js',
  '/games/lib/storage.js', '/games/lib/loop.js', '/games/lib/input.js', '/games/lib/grid.js',
  '/games/catalog.json',
  '/games/data/trick-quiz.json', '/games/data/brain-check.json',
  '/games/tower-game.js',
  '/404.html', '/Images/logo.png', '/Images/wordle-game.jpg',
];
for (const g of cat) {
  paths.push(`/games/${g.slug}.html`);
  paths.push(g.slug === 'tower' ? '/games/tower-game.js' : `/games/${g.slug}.js`);
}
let sw = readFileSync(join(root, 'sw.js'), 'utf8');
sw = sw.replace(/const CACHE_VERSION\s*=\s*'[^']+'/, "const CACHE_VERSION  = 'v11'");
sw = sw.replace(
  /const PRECACHE_STATIC = \[[\s\S]*?\];/,
  `const PRECACHE_STATIC = ${JSON.stringify(paths, null, 2).replace(/\n/g, '\n')};`
);
writeFileSync(join(root, 'sw.js'), sw);
console.log('sw.js updated with', paths.length, 'paths');
