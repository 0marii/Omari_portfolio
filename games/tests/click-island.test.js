import { describe, it, expect } from 'vitest';
import { validateClick, resetClicks, ISLAND_ORDER } from '../logic/click-island.js';

describe('click-island', () => {
  it('validates order', () => {
    let c = resetClicks();
    let last;
    for (const id of ISLAND_ORDER) {
      last = validateClick(c, id);
      expect(last.ok).toBe(true);
      c = last.clicked;
    }
    expect(last.complete).toBe(true);
  });

  it('rejects wrong click', () => {
    const r = validateClick([], 99);
    expect(r.ok).toBe(false);
  });
});
