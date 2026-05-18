/** @param {number} card 0–51 */
export function suit(card) {
  return Math.floor(card / 13);
}

export function rank(card) {
  return (card % 13) + 1;
}

/** @param {number} a @param {number} b tableau piles */
export function canStackTableau(a, b) {
  if (a == null) return rank(b) === 13;
  return suit(a) !== suit(b) && rank(a) === rank(b) + 1;
}

/** @param {number} card @param {number[]} foundation top per suit (-1 empty) */
export function canPlaceFoundation(card, foundation) {
  const s = suit(card);
  const r = rank(card);
  const top = foundation[s];
  if (top < 0) return r === 1;
  return rank(top) + 1 === r;
}

/** @param {number[][]} foundation */
export function isWin(foundation) {
  return foundation.every((pile) => pile.length === 13);
}
