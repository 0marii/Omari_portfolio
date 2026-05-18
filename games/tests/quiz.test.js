import { describe, it, expect } from 'vitest';
import { checkAnswer, nextLives, advance, scoreFor } from '../logic/quiz.js';

const bank = [{ q: '2+2?', choices: ['3', '4'], answer: 1 }];

describe('quiz', () => {
  it('checks answers', () => {
    expect(checkAnswer(bank, 0, 1)).toBe(true);
    expect(checkAnswer(bank, 0, 0)).toBe(false);
  });

  it('lives decrease on wrong', () => {
    expect(nextLives(3, false)).toBe(2);
    expect(nextLives(3, true)).toBe(3);
  });

  it('advances index', () => {
    expect(advance(0, 1)).toBe(-1);
  });

  it('scores correct answers', () => {
    expect(scoreFor(true, 2)).toBeGreaterThan(scoreFor(false, 2));
  });
});
