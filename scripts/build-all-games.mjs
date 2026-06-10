#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const G = join(dirname(fileURLToPath(import.meta.url)), '..', 'games');
mkdirSync(join(G, 'data'), { recursive: true });

function shell({ title, slug, emoji, hud, body, extra = '', module = false, script }) {
  const hudFixed = (hud || ['Score', 'Best']).map((l) => {
    const id = 'hud' + l.replace(/\s+/g, '');
    return `<div class="hud-item"><span class="hud-item__label">${l}</span><span class="hud-item__value" id="${id}">0</span></div>`;
  }).join('\n        ').replace(/<\/motion>/g, '</div>');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <link rel="icon" type="image/png" href="../Images/logo.png"/>
  <title>${title} — M.Games</title>
  <link rel="stylesheet" href="shared.css"/>
  <style>
    .game-main{gap:1rem;position:relative}
    #startScreen{position:absolute;inset:0;z-index:5;background:rgba(5,5,16,.88);backdrop-filter:blur(6px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;border-radius:12px;max-width:100%}
    #startScreen.hidden{opacity:0;pointer-events:none;visibility:hidden;transition:opacity .3s}
    .start-emoji{font-size:3rem}.start-title{font-family:var(--g-mono);font-size:1.35rem;font-weight:700;background:var(--g-grad-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .start-hint{font-family:var(--g-mono);font-size:.8rem;color:var(--g-muted);text-align:center;padding:0 1rem;max-width:28rem;line-height:1.6}
    .canvas-wrap{position:relative;width:min(100%,640px);border-radius:12px;overflow:hidden;border:1px solid var(--g-border);box-shadow:0 0 40px rgba(99,102,241,.1)}
    .canvas-wrap canvas{display:block;width:100%;touch-action:none}
    ${extra}
  </style>
</head>
<body>
  <div class="g-noise" aria-hidden="true"></div>
  <header class="game-header"><div class="game-header__inner">
    <a href="./" class="game-back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg> Back</a>
    <span class="game-title">${title.toUpperCase()}</span>
    <div class="game-hud">${hudFixed}</div>
  </div></header>
  <main class="game-main">${body}</main>
  <div class="game-overlay" id="overlay"><div class="game-overlay__box">
    <span class="game-overlay__emoji" id="overlayEmoji">${emoji}</span>
    <motion class="game-overlay__title" id="overlayTitle">Game Over</div>
    <p class="game-overlay__sub" id="overlaySub"></p>
    <motion class="game-overlay__actions">
      <button type="button" class="g-btn g-btn--primary" id="againBtn">Play Again</button>
      <a href="./" class="g-btn g-btn--outline">← Back to Games</a>
    </div>
  </div></div>
  <script ${module ? 'type="module" ' : ''}src="${script || slug + '.js'}"></script>
  <script src="game-ui.js"></script>
</body></html>`.replace(/<motion /g, '<motion ').replace(/<motion /g, '<div ').replace(/<\/motion>/g, '</div>');
}

function w(slug, title, opts) {
  writeFileSync(join(G, `${slug}.html`), shell({ title, slug, ...opts }));
  if (opts.js) writeFileSync(join(G, opts.jsName || `${slug}.js`), opts.js);
}

const canvasStart = (hint, w, h) => `<div class="canvas-wrap" style="aspect-ratio:${w}/${h}">
  <canvas id="gameCanvas" width="${w}" height="${h}" aria-label="Game"></canvas>
  <div id="startScreen"><span class="start-emoji">🎮</span><span class="start-title">READY</span><p class="start-hint">${hint}</p><button type="button" class="g-btn g-btn--primary" id="startBtn">Start</button></div>
</div>`;

// Fix shell - remove motion from template source
function shell2(o) {
  return shell(o).replace(/<motion /g, '<div ').replace(/<\/motion>/g, '</div>');
}
function w2(slug, title, opts) {
  writeFileSync(join(G, `${slug}.html`), shell2({ title, slug, ...opts }));
  if (opts.js) writeFileSync(join(G, opts.jsName || `${slug}.js`), opts.js);
}

console.log('Building originals + wave 1...');
