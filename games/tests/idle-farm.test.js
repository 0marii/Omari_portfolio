import { describe, it, expect } from 'vitest';
import { tickFarm, buyUpgrade, initialFarm } from '../logic/idle-farm.js';

describe('idle-farm', () => {
  it('ticks coins', () => {
    const s = tickFarm(initialFarm(), 10);
    expect(s.coins).toBe(10);
  });

  it('buys upgrade when affordable', () => {
    const s = { coins: 20, rate: 1, cost: 10 };
    const r = buyUpgrade(s);
    expect(r.bought).toBe(true);
    expect(r.rate).toBe(2);
  });

  it('rejects upgrade when poor', () => {
    const r = buyUpgrade(initialFarm());
    expect(r.bought).toBe(false);
  });
});
