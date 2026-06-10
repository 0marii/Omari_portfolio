#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(readFileSync(join(root, 'games/catalog.json'), 'utf8'));
let html = readFileSync(join(root, 'games/index.html'), 'utf8');

const genres = [...new Set(catalog.map((g) => g.genre))].sort();
const filters = ['all', ...genres];
const filterHtml = filters.map((f, i) =>
  `<button class="g-filter__btn${i === 0 ? ' active' : ''}" data-filter="${f}">${f === 'all' ? 'All' : f === 'io' ? '.io' : f}</button>`
).join('\n          ');

function card(g) {
  const badges = [];
  if (g.hot) badges.push('<span class="g-badge g-badge--hot">HOT</span>');
  if (g.new) badges.push('<span class="g-badge g-badge--new">NEW</span>');
  badges.push(`<span class="g-badge g-badge--genre">${g.genre === 'io' ? '.io' : g.genre}</span>`);
  const tags = g.tags.map((t) => `<span class="g-tag">${t}</span>`).join('');
  const cls = ['g-card', g.featured && 'g-card--featured', g.slug === 'wordle' && 'g-card--has-thumb'].filter(Boolean).join(' ');
  const thumb = g.slug === 'wordle'
    ? `<div class="g-card__thumb"><img src="../Images/wordle-game.jpg" alt="Wordle" loading="lazy" class="g-card__thumb-img"/><div class="g-card__thumb-veil"></div></div>`
    : '';
  return `<a href="${g.slug}.html" class="${cls}" data-genre="${g.genre}" aria-label="Play ${g.title}">
          ${thumb}
          <div class="g-card__badges">${badges.join('')}</div>
          <div class="g-card__icon">${g.icon}</div>
          <h3 class="g-card__title">${g.title}</h3>
          <p class="g-card__desc">${g.desc}</p>
          <div class="g-card__meta">${tags}</div>
          <div class="g-card__play">Play Now <i class="fa-solid fa-arrow-right"></i></div>
        </a>`;
}

const cardsHtml = catalog.map(card).join('\n');

const start = html.indexOf('<!-- Genre Filter -->');
const end = html.indexOf('<!-- ABOUT STRIP -->');
if (start < 0 || end < 0) throw new Error('markers not found');

const block = `<!-- Genre Filter -->
        <div class="g-filter" role="group" aria-label="Filter by genre">
          ${filterHtml}
        </div>
      </div>

      <div class="g-grid">

${cardsHtml}

      </div>
    </div>
  </section>

  `;

html = html.slice(0, start) + block + html.slice(end);
html = html.replace(/<span class="g-dot"><\/span> \d+ Games[^<]*/g, `<span class="g-dot"></span> ${catalog.length} Games · Zero Ads · Vanilla JS`);
html = html.replace(/<title>M\.GAMES[^<]*<\/title>/, `<title>M.GAMES — ${catalog.length} Free Browser Games</title>`);
html = html.replace(/g-section-sub">[^<]*/g, `g-section-sub">${catalog.length} browser games, each built with care. Instant play, no sign-up.`);
html = html.replace(/const STATS = \[\d+,/, `const STATS = [${catalog.length},`);
html = html.replace(/(<span class="g-about__num">)\d+(<\/span>\s*<span class="g-about__label">Games Built)/, `$1${catalog.length}$2`);

writeFileSync(join(root, 'games/index.html'), html);
console.log('Updated', catalog.length, 'games');
