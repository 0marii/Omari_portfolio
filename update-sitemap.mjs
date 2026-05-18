#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = 'https://new-portfolio-self-five.vercel.app';
const cat = JSON.parse(readFileSync(join(root, 'games/catalog.json'), 'utf8'));
const urls = [
  { loc: `${base}/games/`, pri: '0.9' },
  ...cat.map((g) => ({ loc: `${base}/games/${g.slug}`, pri: '0.7' })),
];
const body = urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>monthly</changefreq>
    <priority>${u.pri}</priority>
  </url>`).join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
writeFileSync(join(root, 'sitemap.xml'), xml);
console.log('sitemap:', urls.length, 'urls');
