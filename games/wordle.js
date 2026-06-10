'use strict';

/* ============================================================
   WORDLE — game logic
   ============================================================ */

const WORDS = [
  'apple','bread','chair','dance','eagle','flame','grape','house',
  'input','judge','knife','lemon','music','night','ocean','paint',
  'queen','river','stone','tiger','uncle','vague','water','xerox',
  'yacht','zebra','blank','brave','charm','crisp','drift','elite',
  'flair','gloom','harsh','image','joker','kiosk','lucky','melon',
  'nerve','orbit','pearl','quest','radar','salve','tidal','unity',
  'vivid','waltz'
];

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫']
];

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;
const STATE = { IDLE: 'IDLE', PLAYING: 'PLAYING', REVEALING: 'REVEALING', WIN: 'WIN', LOSE: 'LOSE' };

/* ── DOM refs ─────────────────────────────────────────────── */
const board        = document.getElementById('board');
const keyboard     = document.getElementById('keyboard');
const message      = document.getElementById('message');
const overlay      = document.getElementById('overlay');
const overlayEmoji = document.getElementById('overlayEmoji');
const overlayTitle = document.getElementById('overlayTitle');
const overlaySub   = document.getElementById('overlaySub');
const overlayWord  = document.getElementById('overlayWord');
const overlayScore = document.getElementById('overlayScore');
const playAgainBtn = document.getElementById('playAgainBtn');
const hudScore     = document.getElementById('hudScore');
const hudStreak    = document.getElementById('hudStreak');

/* ── Persistent state ─────────────────────────────────────── */
let score  = 0;
let streak = 0;

function loadStats() {
  try {
    const s = JSON.parse(localStorage.getItem('wordle_stats') || '{}');
    score  = Number(s.score)  || 0;
    streak = Number(s.streak) || 0;
  } catch (_) {}
}

function saveStats() {
  try {
    localStorage.setItem('wordle_stats', JSON.stringify({ score, streak }));
  } catch (_) {}
}

/* ── Game state ───────────────────────────────────────────── */
let targetWord   = '';
let currentRow   = 0;
let currentCol   = 0;
let currentGuess = [];
let gameState    = STATE.IDLE;
let tiles        = [];   // tiles[row][col]
let keyEls       = {};   // letter → <button>

/* ── Initialise ───────────────────────────────────────────── */
function init() {
  loadStats();
  updateHUD();
  buildBoard();
  buildKeyboard();
  startGame();
}

function startGame() {
  targetWord   = WORDS[Math.floor(Math.random() * WORDS.length)];
  currentRow   = 0;
  currentCol   = 0;
  currentGuess = [];
  gameState    = STATE.PLAYING;

  // Reset board tiles
  for (let r = 0; r < MAX_GUESSES; r++) {
    for (let c = 0; c < WORD_LENGTH; c++) {
      const tile = tiles[r][c];
      tile.textContent = '';
      tile.dataset.state = 'empty';
      tile.dataset.letter = '';
    }
  }

  // Reset keyboard key colors
  Object.values(keyEls).forEach(k => {
    delete k.dataset.state;
  });

  hideOverlay();
  clearMessage();
}

/* ── Board construction ───────────────────────────────────── */
function buildBoard() {
  board.innerHTML = '';
  tiles = [];

  for (let r = 0; r < MAX_GUESSES; r++) {
    const row = document.createElement('div');
    row.className = 'tile-row';
    row.setAttribute('role', 'row');
    const rowTiles = [];

    for (let c = 0; c < WORD_LENGTH; c++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.dataset.state = 'empty';
      tile.setAttribute('role', 'gridcell');
      tile.setAttribute('aria-label', 'empty');
      row.appendChild(tile);
      rowTiles.push(tile);
    }

    board.appendChild(row);
    tiles.push(rowTiles);
  }
}

/* ── Keyboard construction ────────────────────────────────── */
function buildKeyboard() {
  keyboard.innerHTML = '';
  keyEls = {};

  KEYBOARD_ROWS.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'key-row';

    row.forEach(label => {
      const btn = document.createElement('button');
      btn.className = 'key';
      btn.textContent = label;
      btn.setAttribute('aria-label', label === '⌫' ? 'backspace' : label);

      if (label === 'ENTER' || label === '⌫') {
        btn.classList.add('wide');
      } else {
        keyEls[label] = btn;
      }

      btn.addEventListener('click', () => handleKey(label));
      rowEl.appendChild(btn);
    });

    keyboard.appendChild(rowEl);
  });
}

/* ── Input handling ───────────────────────────────────────── */
function handleKey(key) {
  if (gameState !== STATE.PLAYING) return;

  if (key === 'ENTER') {
    submitGuess();
  } else if (key === '⌫' || key === 'Backspace') {
    deleteLetter();
  } else if (/^[A-Za-z]$/.test(key)) {
    addLetter(key.toUpperCase());
  }
}

function addLetter(letter) {
  if (currentCol >= WORD_LENGTH) return;
  const tile = tiles[currentRow][currentCol];
  tile.textContent = letter;
  tile.dataset.state = 'filled';
  tile.dataset.letter = letter;
  tile.setAttribute('aria-label', letter);

  tile.classList.remove('pop');
  // Force reflow to restart animation
  void tile.offsetWidth;
  tile.classList.add('pop');

  currentGuess.push(letter);
  currentCol++;
}

function deleteLetter() {
  if (currentCol <= 0) return;
  currentCol--;
  currentGuess.pop();
  const tile = tiles[currentRow][currentCol];
  tile.textContent = '';
  tile.dataset.state = 'empty';
  tile.dataset.letter = '';
  tile.setAttribute('aria-label', 'empty');
}

function submitGuess() {
  if (currentCol < WORD_LENGTH) {
    showMessage('Not enough letters');
    shakeRow(currentRow);
    return;
  }

  const guess = currentGuess.join('').toLowerCase();
  if (!WORDS.includes(guess)) {
    showMessage('Not in word list');
    shakeRow(currentRow);
    return;
  }
  revealRow(guess);
}

/* ── Reveal ───────────────────────────────────────────────── */
function revealRow(guess) {
  gameState = STATE.REVEALING;

  const result = scoreGuess(guess, targetWord);
  const row    = currentRow;

  // Animate each tile with staggered delay
  result.forEach((state, col) => {
    const tile  = tiles[row][col];
    const delay = col * 300; // ms between each tile

    setTimeout(() => {
      tile.classList.add('revealing');

      // At the midpoint of the flip (90°), apply the color
      setTimeout(() => {
        tile.dataset.state = state;
      }, 250);

      tile.addEventListener('animationend', () => {
        tile.classList.remove('revealing');
      }, { once: true });
    }, delay);
  });

  // After all tiles finish animating
  const totalDuration = (WORD_LENGTH - 1) * 300 + 500 + 50;

  setTimeout(() => {
    // Update keyboard colors
    result.forEach((state, col) => {
      const letter = guess[col].toUpperCase();
      const keyEl  = keyEls[letter];
      if (!keyEl) return;

      const priority = { correct: 3, present: 2, absent: 1 };
      const current  = priority[keyEl.dataset.state] || 0;
      if ((priority[state] || 0) > current) {
        keyEl.dataset.state = state;
      }
    });

    const won = result.every(s => s === 'correct');
    currentRow++;

    if (won) {
      score++;
      streak++;
      saveStats();
      updateHUD();
      gameState = STATE.WIN;
      setTimeout(() => showOverlay(true, guess), 400);
    } else if (currentRow >= MAX_GUESSES) {
      streak = 0;
      saveStats();
      updateHUD();
      gameState = STATE.LOSE;
      setTimeout(() => showOverlay(false, targetWord), 400);
    } else {
      currentCol   = 0;
      currentGuess = [];
      gameState    = STATE.PLAYING;
    }
  }, totalDuration);
}

/* ── Scoring ──────────────────────────────────────────────── */
function scoreGuess(guess, target) {
  const result      = Array(WORD_LENGTH).fill('absent');
  const targetLeft  = target.split('');
  const guessLeft   = guess.split('');

  // First pass: correct positions
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessLeft[i] === targetLeft[i]) {
      result[i]    = 'correct';
      targetLeft[i] = null;
      guessLeft[i]  = null;
    }
  }

  // Second pass: present but wrong position
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessLeft[i] === null) continue;
    const idx = targetLeft.indexOf(guessLeft[i]);
    if (idx !== -1) {
      result[i]      = 'present';
      targetLeft[idx] = null;
    }
  }

  return result;
}

/* ── Row shake ────────────────────────────────────────────── */
function shakeRow(rowIndex) {
  const rowEl = board.children[rowIndex];
  if (!rowEl) return;
  rowEl.classList.remove('shake');
  void rowEl.offsetWidth;
  rowEl.classList.add('shake');
  rowEl.addEventListener('animationend', () => rowEl.classList.remove('shake'), { once: true });
}

/* ── Message ──────────────────────────────────────────────── */
let messageTimer = null;

function showMessage(text, duration = 1800) {
  message.textContent = text;
  message.classList.add('show');
  clearTimeout(messageTimer);
  messageTimer = setTimeout(clearMessage, duration);
}

function clearMessage() {
  message.classList.remove('show');
}

/* ── Overlay ──────────────────────────────────────────────── */
function showOverlay(won, word) {
  overlayEmoji.textContent  = won ? '🎉' : '💔';
  overlayTitle.textContent  = won ? 'You got it!' : 'Better luck next time';
  overlayTitle.className    = 'game-overlay__title ' + (won ? 'game-overlay__title--win' : 'game-overlay__title--lose');
  overlaySub.textContent    = won ? 'Brilliant! The word was:' : 'The word was:';
  overlayWord.textContent   = word.toUpperCase();
  overlayScore.textContent  = won ? `Score: ${score} · Streak: ${streak}` : `Streak reset — Score: ${score}`;
  overlay.classList.add('visible');
}

function hideOverlay() {
  overlay.classList.remove('visible');
}

/* ── HUD ──────────────────────────────────────────────────── */
function updateHUD() {
  hudScore.textContent  = score;
  hudStreak.textContent = streak;
}

/* ── Physical keyboard ────────────────────────────────────── */
function onKeyDown(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'Enter')     { handleKey('ENTER');     return; }
  if (e.key === 'Backspace') { handleKey('⌫');         return; }
  if (e.key === 'Delete')    { handleKey('⌫');         return; }
  handleKey(e.key);
}

document.addEventListener('keydown', onKeyDown);

/* ── Play Again ───────────────────────────────────────────── */
playAgainBtn.addEventListener('click', () => {
  startGame();
});

/* ── Boot ─────────────────────────────────────────────────── */
init();
