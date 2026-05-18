'use strict';

const W = 360, H = 600;
const canvas = document.getElementById('flappyCanvas');
const ctx = canvas.getContext('2d');
const hudScore = document.getElementById('hudScore');
const hudBest = document.getElementById('hudBest');

const STATE = { IDLE: 'idle', PLAYING: 'playing', OVER: 'over' };
let state = STATE.IDLE;
let bird, pipes, score, best, frame;

function loadBest() {
  try { best = Number(localStorage.getItem('flappy_best')) || 0; } catch (_) { best = 0; }
  hudBest.textContent = best;
}

function reset() {
  bird = { y: H / 2, vy: 0, r: 16 };
  pipes = [];
  score = 0;
  frame = 0;
  hudScore.textContent = '0';
}

function flap() {
  if (state === STATE.IDLE) { state = STATE.PLAYING; reset(); }
  if (state === STATE.PLAYING) bird.vy = -6.5;
  if (state === STATE.OVER) { state = STATE.PLAYING; reset(); }
}

function spawnPipe() {
  const gap = 140;
  const top = 80 + Math.random() * (H - gap - 160);
  pipes.push({ x: W + 20, top, gap, scored: false });
}

function update() {
  if (state !== STATE.PLAYING) return;
  frame++;
  bird.vy += 0.35;
  bird.y += bird.vy;
  if (frame % 90 === 0) spawnPipe();
  pipes.forEach((p) => { p.x -= 3; });
  pipes = pipes.filter((p) => p.x > -60);
  for (const p of pipes) {
    if (!p.scored && p.x + 50 < 70) { p.scored = true; score++; hudScore.textContent = score; }
    const inX = 70 + bird.r > p.x && 70 - bird.r < p.x + 50;
    if (inX && (bird.y - bird.r < p.top || bird.y + bird.r > p.top + p.gap)) die();
  }
  if (bird.y - bird.r < 0 || bird.y + bird.r > H) die();
}

function die() {
  state = STATE.OVER;
  if (score > best) { best = score; try { localStorage.setItem('flappy_best', String(best)); } catch (_) {} hudBest.textContent = best; }
}

function draw() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0c0c28'); g.addColorStop(1, '#050510');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(99,102,241,0.15)';
  for (let i = 0; i < 8; i++) ctx.fillRect(0, (frame * 2 + i * 80) % H, W, 2);
  ctx.fillStyle = '#6366f1';
  pipes.forEach((p) => {
    ctx.fillRect(p.x, 0, 50, p.top);
    ctx.fillRect(p.x, p.top + p.gap, 50, H - p.top - p.gap);
  });
  ctx.beginPath(); ctx.arc(70, bird.y, bird.r, 0, Math.PI * 2);
  ctx.fillStyle = '#f59e0b'; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.fillRect(78, bird.y - 4, 8, 8);
  if (state === STATE.IDLE) {
    ctx.fillStyle = 'rgba(240,240,255,0.9)'; ctx.font = 'bold 22px JetBrains Mono, monospace';
    ctx.textAlign = 'center'; ctx.fillText('Tap to Start', W / 2, H / 2);
  }
  if (state === STATE.OVER) {
    ctx.fillStyle = 'rgba(240,240,255,0.9)'; ctx.font = 'bold 20px JetBrains Mono, monospace';
    ctx.textAlign = 'center'; ctx.fillText('Game Over — Tap', W / 2, H / 2);
  }
}

function loop() { update(); draw(); requestAnimationFrame(loop); }

canvas.addEventListener('click', flap);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); flap(); }, { passive: false });
window.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); flap(); } });

loadBest(); reset(); loop();
