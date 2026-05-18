/**
 * @param {number} rows
 * @param {number} cols
 * @param {T} fill
 * @returns {T[][]}
 * @template T
 */
export function createGrid(rows, cols, fill) {
  return Array.from({ length: rows }, () => Array(cols).fill(fill));
}

/**
 * @param {number[][]} grid
 * @param {number} r
 * @param {number} c
 */
export function inBounds(grid, r, c) {
  return r >= 0 && c >= 0 && r < grid.length && c < grid[0].length;
}

/**
 * @param {number[][]} grid
 */
export function cloneGrid(grid) {
  return grid.map((row) => [...row]);
}
