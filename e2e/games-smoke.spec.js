import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';

const catalog = JSON.parse(readFileSync('games/catalog.json', 'utf8'));
const slugs = [...new Set(catalog.map((g) => g.slug))];

for (const slug of slugs) {
  test(`loads /games/${slug}`, async ({ page }) => {
    await page.goto(`/games/${slug}.html`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.game-header')).toBeVisible();
    const start = page.locator('#startBtn, #startScreen button, .g-btn--primary').first();
    if (await start.count()) {
      await start.click({ timeout: 3000 }).catch(() => {});
    }
    await expect(page.locator('body')).toBeVisible();
  });
}

test('catalog page loads', async ({ page }) => {
  await page.goto('/games/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.g-grid .g-card')).toHaveCount(slugs.length);
});
