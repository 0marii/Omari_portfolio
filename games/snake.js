'use strict';

/* ============================================================
   SNAKE — game logic
   ============================================================ */

const CELL   = 20;
const BASE_SPEED    = 150; // ms per tick
const MIN_SPEED     = 60;
const SPEED_STEP    = 10;
const FOODS_PER_LVL = 5;

/* ── DOM refs ─────────────────────────────────────────────── */
const canvas      = document.getElementById('snakeCanvas');
const ctx         = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startBtn    = document.getElementById('startBtn');
const overlay     = document.getElementById('overlay');
const playAgainBtn= document.getElementById('playAgainBtn');
const hudScore    = document.getElementById('hudScore');
const hudBest     = document.getElementById('hudBest');
const hudLevel    = document.getElementById('hudLevel');
const goScore     = document.getElementById('goScore');
const goBest      = document.getElementById('goBest');
const goLevel     = document.getElementById('goLevel');
const btnUp       = document.getElementById('btnUp');
const btnDown     = document.getElementById('btnDown');
const btnLeft     = document.getElementById('btnLeft');
const btnRight    = document.getElementById('btnRight');

/* ── Canvas sizing ────────────────────────────────────────── */
function calcCanvasSize() {
  const available = Math.min(window.innerWidth - 40, 520);
  const size      = Math.min(Math.floor(available / CELL) * CELL, 500);
  return size;
}

function resizeCanvas() {
  const size     = calcCanvasSize();
  canvas.width   = size;
  canvas.height  = size;
}

/* ── Game state ───────────────────────────────────────────── */
const STATE = { IDLE: 'IDLE', PLAYING: 'PLAYING', GAMEOVER: 'GAMEOVER' };

let gameState  = STATE.IDLE;
let snake      = [];
let direction  = { x: 1, y: 0 };
let nextDir    = { x: 1, y: 0 };
let food       = { x: 0, y: 0 };
let score      = 0;
let bestScore  = 0;
let level      = 1;
let foodEaten  = 0;
let tickTimer  = null;
let cols       = 0;
let rows       = 0;

/* ── Persistent best score ────────────────────────────────── */
function loadBest() {
  try {
    bestScore = Number(localStorage.getItem('snake_best')) || 0;
  } catch (_) {}
  hudBest.textContent = bestScore;
}

function saveBest() {
  try {
    localStorage.setItem('snake_best', String(bestScore));
  } catch (_) {}
}

/* ── Initialise / reset ───────────────────────────────────── */
function initGame() {
  resizeCanvas();
  cols = Math.floor(canvas.width  / CELL);
  rows = Math.floor(canvas.height / CELL);

  const startX = Math.floor(cols / 2);
  const startY = Math.floor(rows / 2);

  snake      = [
    { x: startX,     y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
  ];
  direction  = { x: 1, y: 0 };
  nextDir    = { x: 1, y: 0 };
  score      = 0;
  level      = 1;
  foodEaten  = 0;

  updateHUD();
  placeFood();
  draw();
}

/* ── Food placement ───────────────────────────────────────── */
function placeFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  food = pos;
}

/* ── Tick ─────────────────────────────────────────────────── */
function startTick() {
  stopTick();
  const interval = Math.max(BASE_SPEED - (level - 1) * SPEED_STEP, MIN_SPEED);
  tickTimer = setInterval(tick, interval);
}

function stopTick() {
  if (tickTimer !== null) {
    clearInterval(tickTimer);
    tickTimer = null;
  }
}

function tick() {
  if (gameState !== STATE.PLAYING) return;

  direction = { ...nextDir };

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  // Wall collision
  if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
    endGame();
    return;
  }

  // Self collision (skip tail since it will move)
  if (snake.slice(0, -1).some(s => s.x === head.x && s.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);

  // Food eaten
  if (head.x === food.x && head.y === food.y) {
    score += level * 10;
    foodEaten++;

    if (foodEaten % FOODS_PER_LVL === 0) {
      level++;
      startTick(); // recalculate speed
    }

    if (score > bestScore) {
      bestScore = score;
      saveBest();
    }

    updateHUD();
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

/* ── Drawing ──────────────────────────────────────────────── */
function draw() {
  const w = canvas.width;
  const h = canvas.height;

  // Background
  ctx.fillStyle = '#010409';
  ctx.fillRect(0, 0, w, h);

  // Grid lines
  ctx.strokeStyle = 'rgba(35,134,54,0.08)';
  ctx.lineWidth   = 0.5;
  for (let x = 0; x <= w; x += CELL) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += CELL) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Snake
  const totalSegs = snake.length;
  snake.forEach((seg, i) => {
    const px = seg.x * CELL;
    const py = seg.y * CELL;
    const isHead = i === 0;

    // Opacity fades toward tail
    const alpha = isHead ? 1 : Math.max(0.25, 1 - (i / totalSegs) * 0.7);

    if (isHead) {
      // Head with gradient
      const grad = ctx.createLinearGradient(px, py, px + CELL, py + CELL);
      grad.addColorStop(0, '#3fb950');
      grad.addColorStop(1, '#238636');
      ctx.shadowColor = '#238636';
      ctx.shadowBlur  = 12;
      ctx.fillStyle   = grad;
    } else {
      ctx.shadowBlur  = 0;
      ctx.fillStyle   = `rgba(46,160,67,${alpha})`;
    }

    const radius = isHead ? 6 : 4;
    roundRect(ctx, px + 1, py + 1, CELL - 2, CELL - 2, radius);
    ctx.fill();
  });

  ctx.shadowBlur = 0;

  // Food
  const cx = food.x * CELL + CELL / 2;
  const cy = food.y * CELL + CELL / 2;
  const r  = CELL / 2 - 2;

  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur  = 18;

  const foodGrad = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, r);
  foodGrad.addColorStop(0, '#f87171');
  foodGrad.addColorStop(1, '#ef4444');

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = foodGrad;
  ctx.fill();

  ctx.shadowBlur = 0;
}

/* ── Rounded rectangle helper ─────────────────────────────── */
function roundRect(context, x, y, w, h, r) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + w - r, y);
  context.quadraticCurveTo(x + w, y, x + w, y + r);
  context.lineTo(x + w, y + h - r);
  context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  context.lineTo(x + r, y + h);
  context.quadraticCurveTo(x, y + h, x, y + h - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

/* ── HUD ──────────────────────────────────────────────────── */
function updateHUD() {
  hudScore.textContent = score;
  hudBest.textContent  = bestScore;
  hudLevel.textContent = level;
}

/* ── Start / End ──────────────────────────────────────────── */
function startGame() {
  gameState = STATE.PLAYING;
  startScreen.classList.add('hidden');
  overlay.classList.remove('visible');
  initGame();
  startTick();
}

function endGame() {
  stopTick();
  gameState = STATE.GAMEOVER;
  draw();
  showOverlay();
}

function showOverlay() {
  goScore.textContent  = score;
  goBest.textContent   = bestScore;
  goLevel.innerHTML    = `Level reached: <strong>${level}</strong>`;
  overlay.classList.add('visible');
}

/* ── Direction input ──────────────────────────────────────── */
function setDirection(dx, dy) {
  // Prevent 180° reversal
  if (dx === -direction.x && dy === -direction.y) return;
  nextDir = { x: dx, y: dy };
}

/* ── Keyboard ─────────────────────────────────────────────── */
function onKeyDown(e) {
  switch (e.key) {
    case 'ArrowUp':    case 'w': case 'W': e.preventDefault(); setDirection(0, -1);  break;
    case 'ArrowDown':  case 's': case 'S': e.preventDefault(); setDirection(0,  1);  break;
    case 'ArrowLeft':  case 'a': case 'A': e.preventDefault(); setDirection(-1, 0);  break;
    case 'ArrowRight': case 'd': case 'D': e.preventDefault(); setDirection(1,  0);  break;
    case ' ':
      if (gameState === STATE.IDLE) startGame();
      break;
    default: break;
  }
}

document.addEventListener('keydown', onKeyDown);

/* ── Mobile D-pad ─────────────────────────────────────────── */
function dpadHandler(dx, dy) {
  return function(e) {
    e.preventDefault();
    if (gameState === STATE.IDLE) {
      startGame();
      return;
    }
    if (gameState === STATE.PLAYING) {
      setDirection(dx, dy);
    }
  };
}

btnUp.addEventListener('touchstart',    dpadHandler(0, -1),  { passive: false });
btnDown.addEventListener('touchstart',  dpadHandler(0,  1),  { passive: false });
btnLeft.addEventListener('touchstart',  dpadHandler(-1, 0),  { passive: false });
btnRight.addEventListener('touchstart', dpadHandler(1,  0),  { passive: false });

// Also support click for non-touch devices showing dpad
btnUp.addEventListener('click',    dpadHandler(0, -1));
btnDown.addEventListener('click',  dpadHandler(0,  1));
btnLeft.addEventListener('click',  dpadHandler(-1, 0));
btnRight.addEventListener('click', dpadHandler(1,  0));

/* ── Touch swipe support ──────────────────────────────────── */
let touchStartX = null;
let touchStartY = null;

canvas.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
  if (touchStartX === null || touchStartY === null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  touchStartX = null;
  touchStartY = null;

  if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
    if (gameState === STATE.IDLE) startGame();
    return;
  }

  if (gameState !== STATE.PLAYING) return;

  if (Math.abs(dx) > Math.abs(dy)) {
    setDirection(dx > 0 ? 1 : -1, 0);
  } else {
    setDirection(0, dy > 0 ? 1 : -1);
  }
}, { passive: true });

/* ── Button events ────────────────────────────────────────── */
startBtn.addEventListener('click', startGame);

playAgainBtn.addEventListener('click', () => {
  startGame();
});

/* ── Window resize ────────────────────────────────────────── */
let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (gameState === STATE.IDLE || gameState === STATE.GAMEOVER) {
      resizeCanvas();
      cols = Math.floor(canvas.width  / CELL);
      rows = Math.floor(canvas.height / CELL);
      draw();
    }
  }, 150);
});

/* ── Boot ─────────────────────────────────────────────────── */
loadBest();
resizeCanvas();
cols = Math.floor(canvas.width  / CELL);
rows = Math.floor(canvas.height / CELL);

// Draw an idle snake on the canvas for aesthetics
(function drawIdle() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(99,102,241,0.05)';
  ctx.lineWidth   = 0.5;
  for (let x = 0; x <= w; x += CELL) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y <= h; y += CELL) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
}());
