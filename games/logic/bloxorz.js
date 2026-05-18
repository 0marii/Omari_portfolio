/** @param {number[][]} map 1=wall 0=floor 2=goal */
export function isGoalCell(map, x, y) {
  return map[y] && map[y][x] === 2;
}

/** Standing on cell */
export function standingOn(map, x, y) {
  return map[y] && map[y][x] !== 1;
}

/** Roll: dx,dy direction. pos: {x,y,mode:'stand'|'lieH'|'lieV'} simplified */
export function tryRoll(map, pos, dx, dy) {
  if (pos.mode === 'stand') {
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (!standingOn(map, nx, ny)) return null;
    if (dx !== 0) return { x: nx, y: ny, mode: 'lieH' };
    return { x: nx, y: ny, mode: 'lieV' };
  }
  if (pos.mode === 'lieH' && dy !== 0) {
    const nx = pos.x;
    const ny = pos.y + dy;
    if (!standingOn(map, nx, ny) || !standingOn(map, nx + 1, ny)) return null;
    return { x: nx, y: ny, mode: 'stand' };
  }
  if (pos.mode === 'lieV' && dx !== 0) {
    const nx = pos.x + dx;
    const ny = pos.y;
    if (!standingOn(map, nx, ny) || !standingOn(map, nx, ny + 1)) return null;
    return { x: nx, y: ny, mode: 'stand' };
  }
  return null;
}

export function isWin(map, pos) {
  if (pos.mode !== 'stand') return false;
  return isGoalCell(map, pos.x, pos.y);
}
