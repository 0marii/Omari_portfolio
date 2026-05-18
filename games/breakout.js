'use strict';

const canvas = document.getElementById('breakoutCanvas');
const ctx = canvas.getContext('2d');
const idleMsg = document.getElementById('idleMsg');
const hudScore = document.getElementById('hudScore');
const hudBest = document.getElementById('hudBest');
const hudLives = document.getElementById('hudLives');
const hudLevel = document.getElementById('hudLevel');
const winOverlay = document.getElementById('winOverlay');
const loseOverlay = document.getElementById('loseOverlay');

const W = 480, H = 560;
let paddle, ball, bricks, score, best, lives, level, running, launched;

function loadBest() {
  try { best = Number(localStorage.getItem('breakout_best')) || 0; } catch (_) { best = 0; }
  hudBest.textContent = best;
}

function makeBricks(lv) {
  bricks = [];
  const rows = 4 + Math.min(lv, 3);
  const cols = 10;
  const colors = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      bricks.push({ x: 20 + c * 44, y: 50 + r * 24, w: 40, h: 18, alive: true, color: colors[r % colors.length] });
    }
  }
}

function resetBall() {
  ball = { x: W / 2, y: H - 80, vx: 4 * (Math.random() > 0.5 ? 1 : -1), vy: -5, r: 7 };
  launched = false;
}

function startLevel() {
  paddle = { x: W / 2 - 45, w: 90, h: 12 };
  makeBricks(level);
  resetBall();
  running = true;
  idleMsg.classList.add('hidden');
}

function resetGame() {
  score = 0; lives = 3; level = 1;
  hudScore.textContent = '0'; hudLives.textContent = '3'; hudLevel.textContent = '1';
  winOverlay.classList.remove('visible');
  loseOverlay.classList.remove('visible');
  startLevel();
}

function launch() {
  if (!running) return;
  if (!launched) launched = true;
}

function update() {
  if (!running || !launched) return;
  ball.x += ball.vx; ball.y += ball.vy;
  if (ball.x - ball.r < 0 || ball.x + ball.r > W) ball.vx *= -1;
  if (ball.y - ball.r < 0) { ball.vy *= -1; ball.y = ball.r; }
  if (ball.y + ball.r > H) {
    lives--;
    hudLives.textContent = lives;
    if (lives <= 0) { running = false; loseOverlay.classList.add('visible'); document.getElementById('loseScore').textContent = 'Score: ' + score; return; }
    resetBall();
    return;
  }
  if (ball.y + ball.r >= H - 30 && ball.x > paddle.x && ball.x < paddle.x + paddle.w && ball.vy > 0) {
    const hit = (ball.x - paddle.x) / paddle.w - 0.5;
    ball.vy = -Math.abs(ball.vy);
    ball.vx = hit * 8;
    ball.y = H - 30 - ball.r;
  }
  bricks.forEach((b) => {
    if (!b.alive) return;
    if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w && ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
      b.alive = false; ball.vy *= -1; score += 10;
      hudScore.textContent = score;
    }
  });
  if (bricks.every((b) => !b.alive)) {
    level++;
    hudLevel.textContent = level;
    if (score > best) { best = score; try { localStorage.setItem('breakout_best', String(best)); } catch (_) {} hudBest.textContent = best; }
    if (level > 5) { running = false; winOverlay.classList.add('visible'); document.getElementById('winScore').textContent = 'Score: ' + score; return; }
    startLevel();
  }
}

function draw() {
  ctx.fillStyle = '#050510'; ctx.fillRect(0, 0, W, H);
  bricks.forEach((b) => {
    if (!b.alive) return;
    ctx.fillStyle = b.color; ctx.shadowColor = b.color; ctx.shadowBlur = 8;
    ctx.fillRect(b.x, b.y, b.w, b.h); ctx.shadowBlur = 0;
  });
  const g = ctx.createLinearGradient(paddle.x, 0, paddle.x + paddle.w, 0);
  g.addColorStop(0, '#6366f1'); g.addColorStop(1, '#ec4899');
  ctx.fillStyle = g; ctx.fillRect(paddle.x, H - 24, paddle.w, paddle.h);
  ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fillStyle = '#f0f0ff'; ctx.fill();
}

canvas.addEventListener('mousemove', (e) => {
  const r = canvas.getBoundingClientRect();
  paddle.x = Math.max(0, Math.min(W - paddle.w, ((e.clientX - r.left) / r.width) * W - paddle.w / 2));
});
canvas.addEventListener('click', launch);
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const t = e.touches[0]; const r = canvas.getBoundingClientRect();
  paddle.x = Math.max(0, Math.min(W - paddle.w, ((t.clientX - r.left) / r.width) * W - paddle.w / 2));
}, { passive: false });
canvas.addEventListener('touchend', (e) => { e.preventDefault(); launch(); });

document.getElementById('winNextBtn').addEventListener('click', () => { winOverlay.classList.remove('visible'); startLevel(); });
document.getElementById('winRestartBtn').addEventListener('click', resetGame);
document.getElementById('loseRestartBtn').addEventListener('click', resetGame);

loadBest(); paddle = { x: 0, w: 90, h: 12 }; ball = { x: W/2, y: H-80, vx: 0, vy: 0, r: 7 }; running = false;
function loop() { update(); draw(); requestAnimationFrame(loop); }
loop();
canvas.addEventListener('click', () => { if (!running) resetGame(); });
