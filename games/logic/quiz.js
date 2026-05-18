/**
 * @typedef {{ q: string, choices: string[], answer: number }} Question
 */

/** @param {Question[]} bank @param {number} idx @param {number} choice */
export function checkAnswer(bank, idx, choice) {
  if (idx < 0 || idx >= bank.length) return false;
  return bank[idx].answer === choice;
}

/** @param {number} lives @param {boolean} correct */
export function nextLives(lives, correct) {
  return correct ? lives : Math.max(0, lives - 1);
}

/** @param {number} idx @param {number} total */
export function advance(idx, total) {
  return idx + 1 >= total ? -1 : idx + 1;
}

export function scoreFor(correct, streak) {
  return correct ? 100 + streak * 10 : 0;
}
