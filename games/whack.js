'use strict';
const grid = document.getElementById('grid');
const start = document.getElementById('startScreen');
const ov = document.getElementById('overlay');
const sub = document.getElementById('overlaySub');
const hs = document.getElementById('hudScore');
const hb = document.getElementById('hudBest');
const ht = document.getElementById('hudTime');

let score = 0;
let best = 0;
let time = 0;
let playing = false;
let timer = null;

function lb() {
  try {
    best = +localStorage.getItem('whack_best') || 0;
  } catch {
    best = 0;
  }
  hb.textContent = best;
}

function build() {
  grid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const b = document.createElement('button');
    b.className = 'hole';
    b.textContent = '🕳️';
    b.dataset.active = 'false';
    b.onclick = () => whack(b);
    grid.appendChild(b);
  }
}

function pop() {
  const holes = document.querySelectorAll('.hole');
  const active = Math.floor(Math.random() * holes.length);

  holes.forEach((b, i) => {
    const isActive = i === active;
    b.textContent = isActive ? '🐹' : '🕳️';
    b.dataset.active = isActive ? 'true' : 'false';
  });
}

function whack(button) {
  if (!playing || button.dataset.active !== 'true') return;

  score += 10;
  hs.textContent = score;
  button.textContent = '🕳️';
  button.dataset.active = 'false';
}

function end() {
  clearInterval(timer);
  timer = null;
  playing = false;
  grid.hidden = true;

  if (score > best) {
    best = score;
    try {
      localStorage.setItem('whack_best', best);
    } catch {}
  }

  hb.textContent = best;
  sub.textContent = 'Score ' + score;
  ov.classList.add('visible');
}

function startGame() {
  clearInterval(timer);
  score = 0;
  time = 30;
  playing = true;
  hs.textContent = '0';
  ht.textContent = String(time);
  start.classList.add('hidden');
  grid.hidden = false;
  build();
  pop();

  timer = setInterval(() => {
    time -= 1;
    ht.textContent = String(time);
    if (time <= 0) {
      end();
      return;
    }
    pop();
  }, 1000);
}

document.getElementById('startBtn').onclick = startGame;
document.getElementById('againBtn').onclick = () => {
  ov.classList.remove('visible');
  start.classList.remove('hidden');
  grid.hidden = true;
};

lb();
