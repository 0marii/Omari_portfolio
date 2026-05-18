import { describe, it, expect } from 'vitest';
import { shuffle, scrambleWord, checkAnswer } from '../logic/word-scramble.js';

describe('word-scramble', () => {
  it('shuffles length', () => {
    expect(shuffle([1, 2, 3], () => 0.5).length).toBe(3);
  });

  it('scramble differs from original when possible', () => {
    const s = scrambleWord('planet', () => 0.1);
    expect(s.length).toBe(6);
  });

  it('checkAnswer is case insensitive', () => {
    expect(checkAnswer('Planet', 'planet')).toBe(true);
    expect(checkAnswer('Planet', 'wrong')).toBe(false);
  });
});
