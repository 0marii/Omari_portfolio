export const WORDS = ['planet', 'rocket', 'neon', 'arcade', 'puzzle', 'galaxy', 'cipher', 'dragon'];

/** Fisher–Yates @param {T[]} arr @param {() => number} rng */
export function shuffle(arr, rng = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function scrambleWord(word, rng = Math.random) {
  const letters = shuffle([...word], rng);
  if (letters.join('') === word && word.length > 1) return scrambleWord(word, rng);
  return letters.join('');
}

export function checkAnswer(target, guess) {
  return target.toLowerCase() === guess.trim().toLowerCase();
}
