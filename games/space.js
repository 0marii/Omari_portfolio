'use strict';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = 480, H = 640;
const startScreen = document.getElementById('startScreen');
const overlay = document.getElementById('overlay');
const overlaySub = document.getElementById('overlaySub');
const hudScore = document.getElementById('hudScore');
const hudBest = document.getElementById('hudBest');

let player, bullets, enemies, score, best, playing, keys, raf;

function loadBest() {
  try { best = Number(localStorage.getItem('space_best')) || 0; } catch (_) { best = 0; }
  hudBest.textContent = best;
}

function reset() {
  player = { x: W / 2 - 20, y: H - 70, w: 40, h: 40 };
  bullets = [];
  enemies = [];
  score = 0;
  hudScore.textContent = '0';
  keys = {};
}

function spawnEnemy() {
  enemies.push({ x: Math.random() * (W - 30), y: -30, w: 30, h: 30, vy: 2 + Math.random() * 2 });
}

function start() {
  reset();
  playing = true;
  startScreen.classList.add('hidden');
  overlay.classList.remove('visible');
  loop();
}

function gameOver() {
  playing = false;
  if (score > best) {
    best = score;
    try { localStorage.setItem('space_best', String(best)); } catch (_) {}
    hudBest.textContent = best;
  }
  overlaySub.textContent = `Score: ${score} · Best: ${best}`;
  overlay.classList.add('visible');
}

function update() {
  if (!playing) return;
  if (keys.ArrowLeft || keys.a) player.x = Math.max(0, player.x - 6);
  if (keys.ArrowRight || keys.d) player.x = Math.min(W - player.w, player.x + 6);
  if (keys[' '] && bullets.length < 8) {
    const last = bullets[bullets.length - 1];
    if (!last || last.y < player.y - 20) bullets.push({ x: player.x + player.w / 2 - 2, y: player.y, w: 4, h: 12, vy: -10 });
  }
  bullets.forEach((b) => { b.y += b.vy; });
  bullets = bullets.filter((b) => b.y > -20);
  enemies.forEach((e) => { e.y += e.vy; });
  if (Math.random() < 0.03) spawnEnemy();
  enemies.forEach((e, ei) => {
    bullets.forEach((b, bi) => {
      if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
        score += 10;
        hudScore.textContent = score;
      }
    });
  });
  enemies = enemies.filter((e) => e.y < H + 40);
  enemies.forEach((e) => {
    if (e.x < player.x + player.w && e.x + e.w > player.x && e.y < player.y + player.h && e.y + e.h > player.y) gameOver();
  });
}

function draw() {
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#6366f1';
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = '#f59e0b';
  bullets.forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));
  ctx.fillStyle = '#ef4444';
  enemies.forEach((e) => ctx.fillRect(e.x, e.y, e.w, e.h);
}

function loop() {
  update();
  draw();
  if (playing) raf = requestAnimationFrame(loop);
}

document.getElementById('startBtn').addEventListener('click', start);
document.getElementById('againBtn').addEventListener('click', () => {
  cancelAnimationFrame(raf);
  startScreen.classList.remove('hidden');
  start();
});
window.addEventListener('keydown', (e) => { keys[e.key] = true; if (e.key === ' ') e.preventDefault(); });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });
loadBest();
