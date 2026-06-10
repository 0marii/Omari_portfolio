import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hero-heading')).toBeVisible();
  await expect(page.locator('#playground')).toBeVisible();
});

test('404 page loads', async ({ page }) => {
  const res = await page.goto('/this-page-does-not-exist', { waitUntil: 'domcontentloaded' });
  expect(res?.status()).toBe(404);
});
