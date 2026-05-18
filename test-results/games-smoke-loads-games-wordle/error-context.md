# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: games-smoke.spec.js >> loads /games/wordle
- Location: e2e/games-smoke.spec.js:8:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:4173/games/wordle.html", waiting until "load"

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
      - generic [ref=e7]: WORDLE
      - generic [ref=e8]:
        - generic [ref=e9]:
          - generic [ref=e10]: Score
          - generic [ref=e11]: "0"
        - generic [ref=e12]:
          - generic [ref=e13]: Streak
          - generic [ref=e14]: "0"
  - main [ref=e15]:
    - grid "Wordle board" [ref=e16]:
      - row "empty empty empty empty empty" [ref=e17]:
        - gridcell "empty" [ref=e18]
        - gridcell "empty" [ref=e19]
        - gridcell "empty" [ref=e20]
        - gridcell "empty" [ref=e21]
        - gridcell "empty" [ref=e22]
      - row "empty empty empty empty empty" [ref=e23]:
        - gridcell "empty" [ref=e24]
        - gridcell "empty" [ref=e25]
        - gridcell "empty" [ref=e26]
        - gridcell "empty" [ref=e27]
        - gridcell "empty" [ref=e28]
      - row "empty empty empty empty empty" [ref=e29]:
        - gridcell "empty" [ref=e30]
        - gridcell "empty" [ref=e31]
        - gridcell "empty" [ref=e32]
        - gridcell "empty" [ref=e33]
        - gridcell "empty" [ref=e34]
      - row "empty empty empty empty empty" [ref=e35]:
        - gridcell "empty" [ref=e36]
        - gridcell "empty" [ref=e37]
        - gridcell "empty" [ref=e38]
        - gridcell "empty" [ref=e39]
        - gridcell "empty" [ref=e40]
      - row "empty empty empty empty empty" [ref=e41]:
        - gridcell "empty" [ref=e42]
        - gridcell "empty" [ref=e43]
        - gridcell "empty" [ref=e44]
        - gridcell "empty" [ref=e45]
        - gridcell "empty" [ref=e46]
      - row "empty empty empty empty empty" [ref=e47]:
        - gridcell "empty" [ref=e48]
        - gridcell "empty" [ref=e49]
        - gridcell "empty" [ref=e50]
        - gridcell "empty" [ref=e51]
        - gridcell "empty" [ref=e52]
    - status
    - group "On-screen keyboard" [ref=e53]:
      - generic [ref=e54]:
        - button "Q" [ref=e55] [cursor=pointer]
        - button "W" [ref=e56] [cursor=pointer]
        - button "E" [ref=e57] [cursor=pointer]
        - button "R" [ref=e58] [cursor=pointer]
        - button "T" [ref=e59] [cursor=pointer]
        - button "Y" [ref=e60] [cursor=pointer]
        - button "U" [ref=e61] [cursor=pointer]
        - button "I" [ref=e62] [cursor=pointer]
        - button "O" [ref=e63] [cursor=pointer]
        - button "P" [ref=e64] [cursor=pointer]
      - generic [ref=e65]:
        - button "A" [ref=e66] [cursor=pointer]
        - button "S" [ref=e67] [cursor=pointer]
        - button "D" [ref=e68] [cursor=pointer]
        - button "F" [ref=e69] [cursor=pointer]
        - button "G" [ref=e70] [cursor=pointer]
        - button "H" [ref=e71] [cursor=pointer]
        - button "J" [ref=e72] [cursor=pointer]
        - button "K" [ref=e73] [cursor=pointer]
        - button "L" [ref=e74] [cursor=pointer]
      - generic [ref=e75]:
        - button "ENTER" [ref=e76] [cursor=pointer]
        - button "Z" [ref=e77] [cursor=pointer]
        - button "X" [ref=e78] [cursor=pointer]
        - button "C" [ref=e79] [cursor=pointer]
        - button "V" [ref=e80] [cursor=pointer]
        - button "B" [ref=e81] [cursor=pointer]
        - button "N" [ref=e82] [cursor=pointer]
        - button "M" [ref=e83] [cursor=pointer]
        - button "backspace" [ref=e84] [cursor=pointer]: ⌫
  - dialog "You got it!":
    - generic:
      - generic: 🎉
      - generic: You got it!
      - generic: The word was
      - generic:
        - button "Play Again"
        - link "← Back to Games":
          - /url: index.html
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