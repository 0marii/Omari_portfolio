export const WORDS = [
  'javascript', 'portfolio', 'browser', 'canvas', 'puzzle', 'arcade',
  'neon', 'tower', 'snake', 'tetris', 'wordle', 'memory', 'strategy',
];

export function pickWord(rng = Math.random) {
  return WORDS[Math.floor(rng() * WORDS.length)];
}

/** @param {string} word @param {Set<string>} guessed */
export function maskedWord(word, guessed) {
  return [...word].map((c) => (guessed.has(c) ? c : '_')).join(' ');
}

/** @param {string} word @param {Set<string>} guessed */
export function isWin(word, guessed) {
  return [...word].every((c) => guessed.has(c));
}

/** @param {number} wrong @param {number} max */
export function isLose(wrong, max = 6) {
  return wrong >= max;
}

/** @param {string} letter @param {Set<string>} guessed */
export function addGuess(letter, guessed) {
  const l = letter.toLowerCase();
  if (!/^[a-z]$/.test(l) || guessed.has(l)) return { guessed, duplicate: true };
  const next = new Set(guessed);
  next.add(l);
  return { guessed: next, duplicate: false };
}
