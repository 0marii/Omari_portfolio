import { describe, it, expect } from 'vitest';
import { tryRoll, isWin, standingOn } from '../logic/bloxorz.js';

const map = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 2, 0],
];

describe('bloxorz', () => {
  it('standing on floor', () => {
    expect(standingOn(map, 0, 0)).toBe(true);
  });

  it('rolls and stands on goal', () => {
    let pos = { x: 0, y: 0, mode: 'stand' };
    pos = tryRoll(map, pos, 1, 0) || pos;
    pos = tryRoll(map, pos, 1, 0) || pos;
    pos = tryRoll(map, pos, 0, 1) || pos;
    expect(pos.mode).toBe('stand');
  });

  it('win on goal', () => {
    expect(isWin(map, { x: 2, y: 2, mode: 'stand' })).toBe(true);
  });
});
