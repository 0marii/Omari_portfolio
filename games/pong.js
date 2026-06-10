'use strict';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = 640, H = 400;
const WIN_SCORE = 7;
const startScreen = document.getElementById('startScreen');
const overlay = document.getElementById('overlay');
const overlaySub = document.getElementById('overlaySub');
const overlayTitle = document.getElementById('overlayTitle');
const overlayEmoji = document.getElementById('overlayEmoji');
const hudScore = document.getElementById('hudScore');
const hudBest = document.getElementById('hudBest');

let paddle, ai, ball, playerScore, aiScore, best, playing, keys, raf;

function loadBest() {
  try { best = Number(localStorage.getItem('pong_best')) || 0; } catch (_) { best = 0; }
  hudBest.textContent = best;
}

function updateHud() {
  hudScore.textContent = `${playerScore} – ${aiScore}`;
}

function resetMatch() {
  paddle = { y: H / 2 - 40, h: 80 };
  ai = { y: H / 2 - 40, h: 80 };
  playerScore = 0;
  aiScore = 0;
  updateHud();
  serve();
}

function serve() {
  ball = { x: W / 2, y: H / 2, vx: 5 * (Math.random() > 0.5 ? 1 : -1), vy: 3 * (Math.random() > 0.5 ? 1 : -1), r: 8 };
}

function endGame(won) {
  playing = false;
  cancelAnimationFrame(raf);
  if (won && playerScore > best) {
    best = playerScore;
    try { localStorage.setItem('pong_best', String(best)); } catch (_) {}
    hudBest.textContent = best;
  }
  overlayTitle.textContent = won ? 'You Win!' : 'AI Wins';
  overlayTitle.className = won ? 'game-overlay__title game-overlay__title--win' : 'game-overlay__title game-overlay__title--lose';
  overlayEmoji.textContent = won ? '🏆' : '🤖';
  overlaySub.textContent = `Final: ${playerScore} – ${aiScore}`;
  overlay.classList.add('visible');
}

function update() {
  if (keys.w || keys.ArrowUp) paddle.y = Math.max(0, paddle.y - 6);
  if (keys.s || keys.ArrowDown) paddle.y = Math.min(H - paddle.h, paddle.y + 6);
  ai.y += (ball.y - (ai.y + ai.h / 2)) * 0.09;
  ai.y = Math.max(0, Math.min(H - ai.h, ai.y));
  ball.x += ball.vx;
  ball.y += ball.vy;
  if (ball.y - ball.r < 0 || ball.y + ball.r > H) ball.vy *= -1;
  if (ball.x - ball.r < 24 && ball.y > paddle.y && ball.y < paddle.y + paddle.h) {
    ball.vx = Math.abs(ball.vx);
    ball.vy += (ball.y - (paddle.y + paddle.h / 2)) * 0.12;
  }
  if (ball.x + ball.r > W - 24 && ball.y > ai.y && ball.y < ai.y + ai.h) ball.vx = -Math.abs(ball.vx);
  if (ball.x < 0) {
    aiScore++;
    updateHud();
    if (aiScore >= WIN_SCORE) return endGame(false);
    serve();
    ball.vx = 5;
  }
  if (ball.x > W) {
    playerScore++;
    updateHud();
    if (playerScore >= WIN_SCORE) return endGame(true);
    serve();
    ball.vx = -5;
  }
}

function draw() {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.setLineDash([8, 12]);
  ctx.beginPath();
  ctx.moveTo(W / 2, 0);
  ctx.lineTo(W / 2, H);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(12, paddle.y, 12, paddle.h);
  ctx.fillRect(W - 24, ai.y, 12, ai.h);
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();
}

function loop() {
  if (!playing) return;
  update();
  draw();
  raf = requestAnimationFrame(loop);
}

function start() {
  resetMatch();
  playing = true;
  keys = {};
  startScreen.classList.add('hidden');
  overlay.classList.remove('visible');
  loop();
}

document.getElementById('startBtn').addEventListener('click', start);
document.getElementById('againBtn').addEventListener('click', () => {
  startScreen.classList.remove('hidden');
  overlay.classList.remove('visible');
});
window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });
loadBest();
