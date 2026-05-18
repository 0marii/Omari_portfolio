'use strict';

// ─── Constants ───────────────────────────────────────────────────────────────
const COLS       = 10;
const ROWS       = 20;
const CELL       = 28;
const COLORS = {
  I: '#06b6d4',
  O: '#f59e0b',
  T: '#a855f7',
  S: '#10b981',
  Z: '#ef4444',
  J: '#3b82f6',
  L: '#f97316',
};

const SHAPES = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1],[0,0,0]],
  S: [[0,1,1],[1,1,0],[0,0,0]],
  Z: [[1,1,0],[0,1,1],[0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]],
  L: [[0,0,1],[1,1,1],[0,0,0]],
};

const PIECE_KEYS = Object.keys(SHAPES);

const LINE_SCORES = [0, 100, 300, 500, 800];

// SRS wall kick offsets (tried in order after basic rotation)
const KICK_OFFSETS = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];

// ─── DOM ─────────────────────────────────────────────────────────────────────
const canvas      = document.getElementById('tetrisCanvas');
const ctx         = canvas.getContext('2d');
const nextCanvas  = document.getElementById('nextCanvas');
const nctx        = nextCanvas.getContext('2d');
const overlay     = document.getElementById('gameOverlay');
const overlayScore= document.getElementById('overlayScore');
const restartBtn  = document.getElementById('restartBtn');
const hudScore    = document.getElementById('hudScore');
const hudLines    = document.getElementById('hudLines');
const hudLevel    = document.getElementById('hudLevel');
const highScoreEl = document.getElementById('highScoreVal');
const pauseBadge  = document.getElementById('pauseBadge');

// ─── State ───────────────────────────────────────────────────────────────────
let board, score, lines, level, highScore;
let currentPiece, nextPiece;
let bag;
let dropTimer, dropInterval;
let rafId;
let lastTime;
let paused, gameOver;
let flashRows; // rows being cleared (animation)
let flashTimer;

// ─── High Score ──────────────────────────────────────────────────────────────
function loadHighScore() {
  try { return parseInt(localStorage.getItem('tetris_hi') || '0', 10); } catch(_) { return 0; }
}
function saveHighScore(s) {
  try { localStorage.setItem('tetris_hi', String(s)); } catch(_) {}
}

// ─── Bag Randomizer ──────────────────────────────────────────────────────────
function refillBag() {
  bag = [...PIECE_KEYS];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
}

function nextFromBag() {
  if (!bag || bag.length === 0) refillBag();
  const key = bag.pop();
  return { key, shape: SHAPES[key].map(r => [...r]), x: 3, y: 0 };
}

// ─── Board ───────────────────────────────────────────────────────────────────
function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

// ─── Collision ───────────────────────────────────────────────────────────────
function collides(piece, dx, dy, shape) {
  const s = shape || piece.shape;
  for (let r = 0; r < s.length; r++) {
    for (let c = 0; c < s[r].length; c++) {
      if (!s[r][c]) continue;
      const nx = piece.x + c + dx;
      const ny = piece.y + r + dy;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

// ─── Rotation ────────────────────────────────────────────────────────────────
function rotate(shape) {
  const N = shape.length;
  const M = shape[0].length;
  const result = Array.from({ length: M }, () => Array(N).fill(0));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < M; c++) {
      result[c][N - 1 - r] = shape[r][c];
    }
  }
  return result;
}

function tryRotate() {
  const rotated = rotate(currentPiece.shape);
  if (!collides(currentPiece, 0, 0, rotated)) {
    currentPiece.shape = rotated;
    return;
  }
  for (const [dx, dy] of KICK_OFFSETS) {
    if (!collides(currentPiece, dx, dy, rotated)) {
      currentPiece.shape = rotated;
      currentPiece.x += dx;
      currentPiece.y += dy;
      return;
    }
  }
}

// ─── Lock & Clear ────────────────────────────────────────────────────────────
function lockPiece() {
  for (let r = 0; r < currentPiece.shape.length; r++) {
    for (let c = 0; c < currentPiece.shape[r].length; c++) {
      if (!currentPiece.shape[r][c]) continue;
      const ny = currentPiece.y + r;
      const nx = currentPiece.x + c;
      if (ny < 0) { triggerGameOver(); return; }
      board[ny][nx] = currentPiece.key;
    }
  }
  checkLines();
}

function checkLines() {
  const full = [];
  for (let r = 0; r < ROWS; r++) {
    if (board[r].every(c => c !== null)) full.push(r);
  }
  if (full.length === 0) {
    spawnNext();
    return;
  }
  // Flash animation
  flashRows  = full;
  flashTimer = 180; // ms
}

function clearLines() {
  const count = flashRows.length;
  flashRows.sort((a, b) => a - b);
  for (const r of [...flashRows].reverse()) {
    board.splice(r, 1);
    board.unshift(Array(COLS).fill(null));
  }
  flashRows = null;
  // Score
  const gained = LINE_SCORES[count] * level;
  score += gained;
  lines += count;
  level = Math.floor(lines / 10) + 1;
  dropInterval = Math.max(50, 1000 - (level - 1) * 100);
  if (score > highScore) { highScore = score; saveHighScore(highScore); }
  updateHUD();
  spawnNext();
}

// ─── Spawn ───────────────────────────────────────────────────────────────────
function spawnNext() {
  currentPiece = nextPiece;
  nextPiece = nextFromBag();
  if (collides(currentPiece, 0, 0)) {
    triggerGameOver();
  }
}

// ─── Ghost piece ─────────────────────────────────────────────────────────────
function getGhostY() {
  let dy = 0;
  while (!collides(currentPiece, 0, dy + 1)) dy++;
  return dy;
}

// ─── Drop ────────────────────────────────────────────────────────────────────
function softDrop() {
  if (!collides(currentPiece, 0, 1)) {
    currentPiece.y++;
    score++;
    hudScore.textContent = score;
  } else {
    lockPiece();
  }
}

function hardDrop() {
  const dy = getGhostY();
  currentPiece.y += dy;
  score += dy * 2;
  hudScore.textContent = score;
  lockPiece();
}

// ─── Game Over ───────────────────────────────────────────────────────────────
function triggerGameOver() {
  gameOver = true;
  cancelAnimationFrame(rafId);
  rafId = null;
  if (score > highScore) { highScore = score; saveHighScore(highScore); }
  highScoreEl.textContent = highScore;
  overlayScore.textContent = 'Score: ' + score;
  overlay.classList.add('visible');
}

// ─── HUD ─────────────────────────────────────────────────────────────────────
function updateHUD() {
  hudScore.textContent  = score;
  hudLines.textContent  = lines;
  hudLevel.textContent  = level;
  highScoreEl.textContent = highScore;
}

// ─── Drawing ─────────────────────────────────────────────────────────────────
function darken(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - 60);
  const g = Math.max(0, ((n >> 8)  & 0xff) - 60);
  const b = Math.max(0, ( n        & 0xff) - 60);
  return `rgb(${r},${g},${b})`;
}

function drawCell(context, x, y, key, alpha, glow) {
  const px = x * CELL;
  const py = y * CELL;
  const color = COLORS[key];
  context.save();
  context.globalAlpha = alpha;
  if (glow) {
    context.shadowColor = color;
    context.shadowBlur  = glow;
  }
  context.fillStyle = color;
  context.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
  context.strokeStyle = darken(color);
  context.lineWidth   = 1;
  context.strokeRect(px + 1.5, py + 1.5, CELL - 3, CELL - 3);
  context.restore();
}

function drawBoard() {
  // Background
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid cells background
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.fillStyle = '#0c0c20';
      ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
      ctx.strokeStyle = 'rgba(99,102,241,0.08)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(c * CELL + 0.25, r * CELL + 0.25, CELL - 0.5, CELL - 0.5);
    }
  }

  // Locked pieces
  for (let r = 0; r < ROWS; r++) {
    if (flashRows && flashRows.includes(r)) continue; // skip flash rows
    for (let c = 0; c < COLS; c++) {
      if (board[r][c]) drawCell(ctx, c, r, board[r][c], 1, 6);
    }
  }

  // Flash animation
  if (flashRows) {
    const flashAlpha = (flashTimer % 60 < 30) ? 1 : 0.3;
    for (const r of flashRows) {
      ctx.save();
      ctx.globalAlpha = flashAlpha;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, r * CELL, COLS * CELL, CELL);
      ctx.restore();
    }
  }
}

function drawGhost() {
  if (!currentPiece || flashRows) return;
  const dy = getGhostY();
  if (dy === 0) return;
  for (let r = 0; r < currentPiece.shape.length; r++) {
    for (let c = 0; c < currentPiece.shape[r].length; c++) {
      if (!currentPiece.shape[r][c]) continue;
      const gx = currentPiece.x + c;
      const gy = currentPiece.y + r + dy;
      if (gy < 0) continue;
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle   = COLORS[currentPiece.key];
      ctx.fillRect(gx * CELL + 1, gy * CELL + 1, CELL - 2, CELL - 2);
      ctx.restore();
    }
  }
}

function drawPiece() {
  if (!currentPiece || flashRows) return;
  for (let r = 0; r < currentPiece.shape.length; r++) {
    for (let c = 0; c < currentPiece.shape[r].length; c++) {
      if (!currentPiece.shape[r][c]) continue;
      const gx = currentPiece.x + c;
      const gy = currentPiece.y + r;
      if (gy < 0) continue;
      drawCell(ctx, gx, gy, currentPiece.key, 1, 14);
    }
  }
}

function drawNext() {
  nctx.fillStyle = 'transparent';
  nctx.clearRect(0, 0, 120, 120);

  if (!nextPiece) return;

  const s  = nextPiece.shape;
  const pw = s[0].length;
  const ph = s.length;
  const cellSize = 24;
  const offX = Math.floor((5 - pw) / 2) * cellSize;
  const offY = Math.floor((5 - ph) / 2) * cellSize;

  for (let r = 0; r < ph; r++) {
    for (let c = 0; c < pw; c++) {
      if (!s[r][c]) continue;
      const px = offX + c * cellSize;
      const py = offY + r * cellSize;
      const color = COLORS[nextPiece.key];
      nctx.save();
      nctx.shadowColor = color;
      nctx.shadowBlur  = 10;
      nctx.fillStyle   = color;
      nctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
      nctx.strokeStyle = darken(color);
      nctx.lineWidth   = 1;
      nctx.strokeRect(px + 1.5, py + 1.5, cellSize - 3, cellSize - 3);
      nctx.restore();
    }
  }
}

// ─── Game Loop ───────────────────────────────────────────────────────────────
function gameLoop(timestamp) {
  if (gameOver) return;

  const dt = Math.min(50, timestamp - (lastTime || timestamp));
  lastTime = timestamp;

  if (!paused) {
    // Handle flash animation
    if (flashRows) {
      flashTimer -= dt;
      if (flashTimer <= 0) {
        clearLines();
      }
    } else {
      dropTimer += dt;
      if (dropTimer >= dropInterval) {
        dropTimer -= dropInterval;
        if (!collides(currentPiece, 0, 1)) {
          currentPiece.y++;
        } else {
          lockPiece();
        }
      }
    }

    drawBoard();
    drawGhost();
    drawPiece();
  }

  drawNext();

  if (!gameOver) {
    rafId = requestAnimationFrame(gameLoop);
  }
}

// ─── Input ───────────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (gameOver) return;
  if (e.key === 'p' || e.key === 'P') {
    paused = !paused;
    pauseBadge.style.display = paused ? 'block' : 'none';
    if (!paused) { lastTime = null; }
    return;
  }
  if (paused) return;
  if (flashRows) return; // ignore input during flash

  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      if (!collides(currentPiece, -1, 0)) currentPiece.x--;
      break;
    case 'ArrowRight':
      e.preventDefault();
      if (!collides(currentPiece, 1, 0)) currentPiece.x++;
      break;
    case 'ArrowDown':
      e.preventDefault();
      softDrop();
      break;
    case 'ArrowUp':
    case 'z':
    case 'Z':
      e.preventDefault();
      tryRotate();
      break;
    case ' ':
      e.preventDefault();
      hardDrop();
      break;
  }
});

// ─── Touch swipe on canvas ────────────────────────────────────────────────────
let tetTouchX = null;
let tetTouchY = null;

canvas.addEventListener('touchstart', e => {
  if (e.touches.length !== 1) return;
  tetTouchX = e.touches[0].clientX;
  tetTouchY = e.touches[0].clientY;
}, { passive: true });

canvas.addEventListener('touchend', e => {
  if (tetTouchX === null) return;
  if (gameOver || paused || flashRows) { tetTouchX = null; tetTouchY = null; return; }
  const dx = e.changedTouches[0].clientX - tetTouchX;
  const dy = e.changedTouches[0].clientY - tetTouchY;
  tetTouchX = null; tetTouchY = null;

  const MIN = 20;
  if (Math.abs(dx) < MIN && Math.abs(dy) < MIN) {
    // Tap = rotate
    tryRotate();
    return;
  }
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && !collides(currentPiece, 1, 0)) currentPiece.x++;
    else if (dx < 0 && !collides(currentPiece, -1, 0)) currentPiece.x--;
  } else {
    if (dy > 0) hardDrop();
  }
}, { passive: true });

// Mobile buttons
function bindMobileBtn(id, action) {
  const el = document.getElementById(id);
  if (!el) return;
  let interval = null;
  const repeatAction = (continuous) => {
    if (gameOver || paused || flashRows) return;
    action();
    if (continuous) {
      interval = setInterval(() => {
        if (gameOver || paused) { clearInterval(interval); return; }
        action();
      }, 100);
    }
  };
  el.addEventListener('touchstart', e => { e.preventDefault(); repeatAction(id === 'mobLeft' || id === 'mobRight'); }, { passive: false });
  el.addEventListener('touchend',   e => { e.preventDefault(); if (interval) { clearInterval(interval); interval = null; } }, { passive: false });
  el.addEventListener('mousedown',  () => repeatAction(false));
}

bindMobileBtn('mobLeft',   () => { if (!collides(currentPiece, -1, 0)) currentPiece.x--; });
bindMobileBtn('mobRight',  () => { if (!collides(currentPiece,  1, 0)) currentPiece.x++; });
bindMobileBtn('mobRotate', () => tryRotate());
bindMobileBtn('mobDown',   () => softDrop());
bindMobileBtn('mobDrop',   () => hardDrop());

// ─── Init / Restart ──────────────────────────────────────────────────────────
function init() {
  board        = createBoard();
  score        = 0;
  lines        = 0;
  level        = 1;
  dropTimer    = 0;
  dropInterval = 1000;
  paused       = false;
  gameOver     = false;
  flashRows    = null;
  flashTimer   = 0;
  lastTime     = null;
  highScore    = loadHighScore();

  refillBag();
  currentPiece = nextFromBag();
  nextPiece    = nextFromBag();

  overlay.classList.remove('visible');
  pauseBadge.style.display = 'none';

  updateHUD();

  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(gameLoop);
}

restartBtn.addEventListener('click', init);

init();
