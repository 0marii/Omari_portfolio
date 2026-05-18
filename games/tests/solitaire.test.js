import { describe, it, expect } from 'vitest';
import { suit, rank, canStackTableau, canPlaceFoundation, isWin } from '../logic/solitaire.js';

describe('solitaire', () => {
  it('parses cards', () => {
    expect(suit(14)).toBe(1);
    expect(rank(14)).toBe(2);
  });

  it('tableau stacking', () => {
    const redKing = 12;
    const blackQueen = 24;
    expect(canStackTableau(null, redKing)).toBe(true);
    expect(canStackTableau(redKing, blackQueen)).toBe(true);
  });

  it('foundation ace', () => {
    expect(canPlaceFoundation(0, [-1, -1, -1, -1])).toBe(true);
  });

  it('win detection', () => {
    const f = [[], [], [], []].map(() => Array(13).fill(0));
    expect(isWin(f)).toBe(true);
  });
});
