'use strict';

const EMOJIS = ['🎮', '🎯', '🚀', '⭐', '🔥', '💎', '🌙', '🎵', '🦊', '🍀', '🎲', '🌈'];
const boardEl = document.getElementById('board');
const startScreen = document.getElementById('startScreen');
const overlay = document.getElementById('overlay');
const overlaySub = document.getElementById('overlaySub');
const hudMoves = document.getElementById('hudMoves');
const hudBest = document.getElementById('hudBest');

let cols = 4, rows = 4, cards = [], flipped = [], moves = 0, lock = false, playing = false;
let diffBtns = document.querySelectorAll('.diff-btn');

function bestKey() { return `memory_best_${cols}x${rows}`; }
function loadBest() {
  try { const v = localStorage.getItem(bestKey()); hudBest.textContent = v || '—'; } catch (_) { hudBest.textContent = '—'; }
}
function saveBest(m) {
  try {
    const k = bestKey();
    const prev = Number(localStorage.getItem(k));
    if (!prev || m < prev) { localStorage.setItem(k, String(m)); hudBest.textContent = m; }
  } catch (_) {}
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck() {
  const n = (cols * rows) / 2;
  const pool = shuffle([...EMOJIS].slice(0, n));
  const deck = shuffle([...pool, ...pool].map((e, i) => ({ id: i, emoji: e, matched: false })));
  return deck;
}

function renderBoard() {
  boardEl.style.gridTemplateColumns = `repeat(${cols}, minmax(56px, 1fr))`;
  boardEl.innerHTML = '';
  cards.forEach((c, i) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'card';
    el.dataset.i = i;
    el.textContent = c.matched || flipped.includes(i) ? c.emoji : '?';
    if (c.matched) el.classList.add('matched');
    if (flipped.includes(i)) el.classList.add('flipped');
    el.addEventListener('click', () => onFlip(i));
    boardEl.appendChild(el);
  });
}

function onFlip(i) {
  if (!playing || lock || cards[i].matched || flipped.includes(i)) return;
  if (flipped.length === 2) return;
  flipped.push(i);
  renderBoard();
  if (flipped.length < 2) return;
  moves++;
  hudMoves.textContent = moves;
  lock = true;
  const [a, b] = flipped;
  if (cards[a].emoji === cards[b].emoji) {
    cards[a].matched = cards[b].matched = true;
    flipped = [];
    lock = false;
    renderBoard();
    if (cards.every((c) => c.matched)) win();
  } else {
    setTimeout(() => { flipped = []; lock = false; renderBoard(); }, 700);
  }
}

function win() {
  playing = false;
  saveBest(moves);
  overlaySub.textContent = `Completed in ${moves} moves.`;
  overlay.classList.add('visible');
}

function startGame() {
  cards = buildDeck();
  flipped = [];
  moves = 0;
  lock = false;
  playing = true;
  hudMoves.textContent = '0';
  loadBest();
  startScreen.hidden = true;
  boardEl.hidden = false;
  renderBoard();
}

function resetToMenu() {
  playing = false;
  overlay.classList.remove('visible');
  boardEl.hidden = true;
  startScreen.hidden = false;
}

diffBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    diffBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    cols = Number(btn.dataset.cols);
    rows = Number(btn.dataset.rows);
    loadBest();
  });
});

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('againBtn').addEventListener('click', resetToMenu);
loadBest();
