#!/usr/bin/env node
/**
 * Generates game HTML shells + minimal playable JS for M.GAMES expansion.
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'games');

function shell({ title, slug, genre, emoji, hud = ['Score', 'Best'], extra = '', body, script }) {
  const hudHtml = hud.map((label, i) => {
    const id = label.toLowerCase().replace(/\s+/g, '');
    return `<div class="hud-item"><span class="hud-item__label">${label}</span><span class="hud-item__value" id="hud${id.charAt(0).toUpperCase() + id.slice(1)}">0</span></div>`;
  }).join('\n      ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — M.Games</title>
  <link rel="stylesheet" href="shared.css" />
  <link rel="icon" type="image/png" href="../Images/logo.png"/>
  <style>${extra}</style>
</head>
<body>
  <div class="g-noise" aria-hidden="true"></div>
  <header class="game-header"><motion class="game-header__inner">
    <a href="./" class="game-back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg> Back</a>
    <span class="game-title">${title.toUpperCase()}</span>
    <div class="game-hud">${hudHtml}</div>
  </div></header>
  <main class="game-main">${body}</main>
  <div class="game-overlay" id="overlay"><div class="game-overlay__box">
    <span class="game-overlay__emoji">${emoji}</span>
    <div class="game-overlay__title" id="overlayTitle">Game Over</div>
    <p class="game-overlay__sub" id="overlaySub"></p>
    <button class="g-btn g-btn--primary" id="againBtn">Play Again</button>
  </div></div>
  <script src="${script || slug + '.js'}"></script>
  <script src="game-ui.js"></script>
</body>
</html>`;
}

mkdirSync(ROOT, { recursive: true });

const canvasStyle = `
    .canvas-wrap { position: relative; width: 480px; max-width: 100%; }
    canvas { display: block; width: 100%; border-radius: 12px; border: 1px solid var(--g-border); touch-action: none; }
`;

const games = [
  { slug: 'memory', title: 'Memory Match', genre: 'Memory', type: 'dom' },
  { slug: 'tictactoe', title: 'Tic-Tac-Toe', genre: 'Strategy', type: 'dom' },
  { slug: 'space', title: 'Space Shooter', genre: 'Action', type: 'canvas', w: 480, h: 640 },
  { slug: 'dino', title: 'Dino Runner', genre: 'Action', type: 'canvas', w: 800, h: 200 },
  { slug: 'whack', title: 'Whack-a-Mole', genre: 'Skill', type: 'dom' },
  { slug: 'pong', title: 'Pong', genre: 'Skill', type: 'canvas', w: 640, h: 400 },
  { slug: 'connect4', title: 'Connect 4', genre: 'Strategy', type: 'dom' },
  { slug: 'tower', title: 'Building Tower', genre: 'Arcade', type: 'canvas', w: 400, h: 600 },
  { slug: 'hangman', title: 'Hangman', genre: 'Word', type: 'dom' },
  { slug: 'word-scramble', title: 'Word Scramble', genre: 'Word', type: 'dom' },
  { slug: 'trick-quiz', title: 'Trick Quiz', genre: 'Trivia', type: 'dom' },
  { slug: 'brain-check', title: 'Brain Check', genre: 'Trivia', type: 'dom' },
  { slug: 'idle-farm', title: 'Idle Farm', genre: 'Clicker', type: 'dom' },
  { slug: 'mix-master', title: 'Mix Master', genre: 'Card', type: 'dom' },
  { slug: 'solitaire', title: 'Solitaire', genre: 'Card', type: 'dom' },
  { slug: 'gold-hook', title: 'Gold Hook', genre: 'Arcade', type: 'canvas', w: 480, h: 400 },
  { slug: 'bubble-spin', title: 'Bubble Spin', genre: 'Arcade', type: 'canvas', w: 400, h: 400 },
  { slug: 'bull-run', title: 'Bull Run', genre: 'Driving', type: 'canvas', w: 480, h: 320 },
  { slug: 'neon-drift', title: 'Neon Drift', genre: 'Driving', type: 'canvas', w: 400, h: 560 },
  { slug: 'cell-feast', title: 'Cell Feast', genre: 'io', type: 'canvas', w: 480, h: 480 },
  { slug: 'home-run', title: 'Home Run', genre: 'Sports', type: 'canvas', w: 480, h: 400 },
  { slug: 'block-roll', title: 'Block Roll', genre: 'Puzzle', type: 'dom' },
  { slug: 'tile-link', title: 'Tile Link', genre: 'Puzzle', type: 'dom' },
  { slug: 'dice-wars', title: 'Dice Wars', genre: 'Board', type: 'canvas', w: 480, h: 480 },
  { slug: 'neon-checkers', title: 'Neon Checkers', genre: 'Board', type: 'dom' },
  { slug: 'lane-defense', title: 'Lane Defense', genre: 'Shooting', type: 'canvas', w: 640, h: 480 },
  { slug: 'pizza-queue', title: 'Pizza Queue', genre: 'Simulation', type: 'dom' },
  { slug: 'diner-rush', title: 'Diner Rush', genre: 'Simulation', type: 'dom' },
  { slug: 'balloon-td', title: 'Balloon TD', genre: 'Strategy', type: 'canvas', w: 640, h: 480 },
  { slug: 'hex-conquest', title: 'Hex Conquest', genre: 'Strategy', type: 'canvas', w: 520, h: 400 },
  { slug: 'neon-pool', title: 'Neon Pool', genre: 'Sports', type: 'canvas', w: 480, h: 800 },
];

for (const g of games) {
  const htmlPath = join(ROOT, `${g.slug}.html`);
  if (g.type === 'canvas') {
    const body = `<div class="canvas-wrap"><canvas id="gameCanvas" width="${g.w}" height="${g.h}" aria-label="${g.title}"></canvas></div>
    <p class="game-controls"><span class="game-controls__key">Click / Tap to play</span></p>`;
    const html = shell({ title: g.title, slug: g.slug, genre: g.genre, emoji: '🎮', body, extra: canvasStyle });
    writeFileSync(htmlPath, html.replace(/<motion /g, '<div ').replace(/<\/motion>/g, '</div>'));
  }
}

console.log('Partial generation done — run full game JS separately');
