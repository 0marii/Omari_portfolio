/** @param {number} level 0–100 */
export function pourQuality(level) {
  if (level >= 45 && level <= 55) return 'perfect';
  if (level >= 35 && level <= 65) return 'good';
  return 'bad';
}

/** @param {number} pour @param {number} target */
export function nextLevel(pour, target) {
  return Math.min(100, Math.max(0, target + pour * 0.35));
}

export function isWin(level) {
  return level >= 95;
}
