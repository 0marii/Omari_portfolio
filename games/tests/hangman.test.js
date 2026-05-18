import { describe, it, expect } from 'vitest';
import { pickWord, maskedWord, isWin, isLose, addGuess } from '../logic/hangman.js';

describe('hangman', () => {
  it('masks unguessed letters', () => {
    expect(maskedWord('hello', new Set(['e']))).toBe('_ e _ _ _');
  });

  it('detects win', () => {
    expect(isWin('hi', new Set(['h', 'i']))).toBe(true);
  });

  it('detects lose', () => {
    expect(isLose(6)).toBe(true);
    expect(isLose(5)).toBe(false);
  });

  it('dedupes guesses', () => {
    const g = new Set(['a']);
    const r = addGuess('a', g);
    expect(r.duplicate).toBe(true);
  });

  it('pickWord returns from list', () => {
    expect(pickWord(() => 0)).toBeTruthy();
  });
});
