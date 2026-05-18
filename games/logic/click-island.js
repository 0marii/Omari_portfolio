/** Correct click order for Grow Island–style puzzle */
export const ISLAND_ORDER = [2, 0, 4, 1, 3, 5];

/** @param {number[]} clicked @param {number} id */
export function validateClick(clicked, id) {
  const expected = ISLAND_ORDER[clicked.length];
  if (id !== expected) return { ok: false, complete: false, clicked };
  const next = [...clicked, id];
  return { ok: true, complete: next.length === ISLAND_ORDER.length, clicked: next };
}

export function resetClicks() {
  return [];
}
