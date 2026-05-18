'use strict';

const boardEl = document.getElementById('board');
const hudScore = document.getElementById('hudScore');
const hudBest = document.getElementById('hudBest');
const overlay = document.getElementById('overlay');
const againBtn = document.getElementById('againBtn');
const newBtn = document.getElementById('newBtn');

let grid, score, best;

function loadBest() {
  try { best = Number(localStorage.getItem('2048_best')) || 0; } catch (_) { best = 0; }
  hudBest.textContent = best;
}

function empty() { return Array.from({ length: 4 }, () => [0, 0, 0, 0]); }

function spawn() {
  const cells = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (!grid[r][c]) cells.push([r, c]);
  if (!cells.length) return;
  const [r, c] = cells[Math.floor(Math.random() * cells.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function render() {
  boardEl.innerHTML = '';
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const v = grid[r][c];
      const d = document.createElement('div');
      d.className = 'cell';
      if (v) { d.dataset.v = v; d.textContent = v; }
      boardEl.appendChild(d);
    }
  }
  hudScore.textContent = score;
}

function slide(row) {
  const arr = row.filter((x) => x);
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] && arr[i] === arr[i + 1]) {
      arr[i] *= 2; score += arr[i]; arr[i + 1] = 0;
    }
  }
  const merged = arr.filter((x) => x);
  while (merged.length < 4) merged.push(0);
  return merged;
}

function move(dir) {
  const prev = JSON.stringify(grid);
  if (dir === 'left') grid = grid.map((row) => slide(row));
  if (dir === 'right') grid = grid.map((row) => slide([...row].reverse()).reverse());
  if (dir === 'up') {
    for (let c = 0; c < 4; c++) {
      const col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
      const s = slide(col);
      for (let r = 0; r < 4; r++) grid[r][c] = s[r];
    }
  }
  if (dir === 'down') {
    for (let c = 0; c < 4; c++) {
      const col = [grid[3][c], grid[2][c], grid[1][c], grid[0][c]];
      const s = slide(col);
      for (let r = 0; r < 4; r++) grid[3 - r][c] = s[r];
    }
  }
  if (JSON.stringify(grid) !== prev) spawn();
  if (score > best) { best = score; try { localStorage.setItem('2048_best', String(best)); } catch (_) {} hudBest.textContent = best; }
  render();
  if (grid.flat().includes(2048)) { overlay.classList.add('visible'); document.getElementById('overlayTitle').textContent = 'You reached 2048!'; }
}

function canMove() {
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    if (!grid[r][c]) return true;
    if (c < 3 && grid[r][c] === grid[r][c + 1]) return true;
    if (r < 3 && grid[r][c] === grid[r + 1][c]) return true;
  }
  return false;
}

function newGame() {
  grid = empty(); score = 0; overlay.classList.remove('visible');
  spawn(); spawn(); render();
}

window.addEventListener('keydown', (e) => {
  const m = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
  if (m[e.key]) { e.preventDefault(); move(m[e.key]); if (!canMove()) overlay.classList.add('visible'); }
});

let tx, ty;
boardEl.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
boardEl.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - tx;
  const dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) move(dx > 0 ? 'right' : 'left');
  else if (Math.abs(dy) > 30) move(dy > 0 ? 'down' : 'up');
});

againBtn.addEventListener('click', newGame);
newBtn.addEventListener('click', newGame);
loadBest(); newGame();
