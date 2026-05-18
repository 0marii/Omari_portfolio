'use strict';
const R = 6;
const C = 7;
const start = document.getElementById('startScreen');
const boardEl = document.getElementById('board');
const ov = document.getElementById('overlay');
const title = document.getElementById('overlayTitle');

let g, turn, playing, me = 1, ai = 2;
const empty = () => Array.from({ length: R }, () => Array(C).fill(0));

function check(p) {
  for (let y = 0; y < R; y++) {
    for (let x = 0; x < C; x++) {
      if (g[y][x] !== p) continue;
      for (const [dy, dx] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
        let n = 1;
        for (let k = 1; k < 4; k++) {
          const ny = y + dy * k;
          const nx = x + dx * k;
          if (g[ny]?.[nx] === p) n++;
          else break;
        }
        if (n >= 4) return true;
      }
    }
  }
  return false;
}

function render() {
  boardEl.innerHTML = '';
  boardEl.style.display = 'grid';
  boardEl.style.gridTemplateColumns = `repeat(${C}, minmax(40px, 1fr))`;
  boardEl.style.gap = '6px';

  for (let c = 0; c < C; c++) {
    const b = document.createElement('button');
    b.textContent = '⬇';
    b.className = 'g-btn g-btn--outline';
    b.style.padding = '0.3rem';
    b.onclick = () => play(c);
    boardEl.appendChild(b);
  }

  for (let y = 0; y < R; y++) {
    for (let x = 0; x < C; x++) {
      const d = document.createElement('div');
      d.className = 'cell';
      d.textContent = g[y][x] === me ? '🔴' : g[y][x] === ai ? '🟡' : '';
      boardEl.appendChild(d);
    }
  }
}

function aiMove() {
  const valid = [];
  for (let cc = 0; cc < C; cc++) {
    if (!g[0][cc]) valid.push(cc);
  }

  if (!valid.length) return;

  const col = valid[Math.floor(Math.random() * valid.length)];
  for (let y = R - 1; y >= 0; y--) {
    if (!g[y][col]) {
      g[y][col] = ai;
      if (check(ai)) {
        end(false);
        return;
      }
      break;
    }
  }

  render();
  if (!check(ai) && !g.every(r => r.every(v => v))) {
    turn = me;
  }
}

function play(c) {
  if (!playing) return;

  for (let y = R - 1; y >= 0; y--) {
    if (!g[y][c]) {
      g[y][c] = turn;
      if (check(turn)) return end(turn === me);
      if (g.every(r => r.every(v => v))) return end(null);
      turn = turn === me ? ai : me;
      render();

      if (turn === ai) {
        setTimeout(() => {
          aiMove();
        }, 400);
      }
      return;
    }
  }
}

function end(w) {
  playing = false;
  title.textContent = w === true ? 'You Win!' : w === false ? 'AI Wins' : 'Draw';
  title.className = w === true ? 'game-overlay__title game-overlay__title--win' : 'game-overlay__title';
  ov.classList.add('visible');
}

document.getElementById('startBtn').onclick = () => {
  g = empty();
  turn = me;
  playing = true;
  title.className = 'game-overlay__title';
  start.classList.add('hidden');
  boardEl.hidden = false;
  render();
};

document.getElementById('againBtn').onclick = () => {
  ov.classList.remove('visible');
  start.classList.remove('hidden');
  boardEl.hidden = true;
};
