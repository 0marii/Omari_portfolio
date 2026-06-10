'use strict';

const grid = document.getElementById('grid');
const start = document.getElementById('startScreen');
const overlay = document.getElementById('overlay');
const title = document.getElementById('overlayTitle');
const sub = document.getElementById('overlaySub');
const hudScore = document.getElementById('hudScore');
const hudBest = document.getElementById('hudBest');
const hudTime = document.getElementById('hudTime');

const DURATION = 30;
const HOLES = 9;

let playing = false;
let score = 0;
let best = 0;
let timeLeft = DURATION;
let activeHole = -1;
let tickTimer = null;
let moleTimer = null;

function loadBest() {
  try { best = Number(localStorage.getItem('whack_best')) || 0; } catch (_) { best = 0; }
  hudBest.textContent = best;
}

function saveBest() {
  if (score > best) {
    best = score;
    try { localStorage.setItem('whack_best', String(best)); } catch (_) {}
    hudBest.textContent = best;
  }
}

function buildGrid() {
  grid.innerHTML = '';
  for (let i = 0; i < HOLES; i++) {
    const hole = document.createElement('button');
    hole.type = 'button';
    hole.className = 'hole';
    hole.dataset.i = String(i);
    hole.addEventListener('click', () => whack(i));
    grid.appendChild(hole);
  }
}

function setActive(idx) {
  activeHole = idx;
  grid.querySelectorAll('.hole').forEach((h, i) => {
    h.classList.toggle('up', i === idx);
  });
}

function scheduleMole() {
  if (!playing) return;
  const idx = Math.floor(Math.random() * HOLES);
  setActive(idx);
  const showMs = Math.max(400, 900 - score * 12);
  moleTimer = setTimeout(() => {
    setActive(-1);
    scheduleMole();
  }, showMs);
}

function whack(i) {
  if (!playing || i !== activeHole) return;
  score++;
  hudScore.textContent = score;
  GameUI?.popHud?.(hudScore);
  setActive(-1);
  clearTimeout(moleTimer);
  scheduleMole();
}

function endGame() {
  playing = false;
  clearInterval(tickTimer);
  clearTimeout(moleTimer);
  setActive(-1);
  saveBest();
  title.textContent = 'Time\'s Up!';
  sub.textContent = `You scored ${score} hits.`;
  overlay.classList.add('visible');
}

function startGame() {
  score = 0;
  timeLeft = DURATION;
  hudScore.textContent = '0';
  hudTime.textContent = String(timeLeft);
  playing = true;
  start.classList.add('hidden');
  grid.hidden = false;
  overlay.classList.remove('visible');
  buildGrid();
  scheduleMole();
  tickTimer = setInterval(() => {
    timeLeft--;
    hudTime.textContent = String(timeLeft);
    if (timeLeft <= 0) endGame();
  }, 1000);
}

document.getElementById('startBtn').onclick = startGame;
document.getElementById('againBtn').onclick = () => {
  overlay.classList.remove('visible');
  start.classList.remove('hidden');
  grid.hidden = true;
};

loadBest();
