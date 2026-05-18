import { describe, it, expect } from 'vitest';
import { pourQuality, nextLevel, isWin } from '../logic/mix-master.js';

describe('mix-master', () => {
  it('rates pour quality', () => {
    expect(pourQuality(50)).toBe('perfect');
    expect(pourQuality(10)).toBe('bad');
  });

  it('levels up', () => {
    expect(nextLevel(10, 0)).toBeGreaterThan(0);
  });

  it('wins at 95', () => {
    expect(isWin(95)).toBe(true);
    expect(isWin(50)).toBe(false);
  });
});
