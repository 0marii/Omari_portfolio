# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: games-smoke.spec.js >> loads /games/flappy
- Location: e2e/games-smoke.spec.js:8:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:4173/games/flappy.html", waiting until "load"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "← Back" [ref=e4] [cursor=pointer]:
        - /url: index.html
        - text: ←
        - img [ref=e5]
        - text: Back
      - generic [ref=e7]: FLAPPY BIRD
      - generic [ref=e8]:
        - generic [ref=e9]:
          - generic [ref=e10]: Score
          - generic [ref=e11]: "0"
        - generic [ref=e12]:
          - generic [ref=e13]: Best
          - generic [ref=e14]: "0"
  - main [ref=e15]:
    - generic "Flappy Bird game canvas" [ref=e17] [cursor=pointer]
    - generic [ref=e18]:
      - generic [ref=e19]: Space
      - generic [ref=e20]: or
      - text: Tap to flap
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { readFileSync } from 'fs';
  3  | 
  4  | const catalog = JSON.parse(readFileSync('games/catalog.json', 'utf8'));
  5  | const slugs = [...new Set(catalog.map((g) => g.slug))];
  6  | 
  7  | for (const slug of slugs) {
  8  |   test(`loads /games/${slug}`, async ({ page }) => {
> 9  |     await page.goto(`/games/${slug}.html`);
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  10 |     await expect(page.locator('.game-header')).toBeVisible();
  11 |     const start = page.locator('#startBtn, #startScreen button, .g-btn--primary').first();
  12 |     if (await start.count()) {
  13 |       await start.click({ timeout: 3000 }).catch(() => {});
  14 |     }
  15 |     await expect(page.locator('body')).toBeVisible();
  16 |   });
  17 | }
  18 | 
  19 | test('catalog page loads', async ({ page }) => {
  20 |   await page.goto('/games/');
  21 |   await expect(page.locator('.g-grid .g-card')).toHaveCount(slugs.length);
  22 | });
  23 | 
```