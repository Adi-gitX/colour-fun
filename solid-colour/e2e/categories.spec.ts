import { test, expect } from '@playwright/test';

test.describe('Category Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=All Colors')).toBeVisible();
  });

  test('default shows all 238 colors', async ({ page }) => {
    await expect(page.locator('text=238 colors').first()).toBeVisible();
  });

  test('multiple searches return correct results', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search colors/i);

    await searchInput.fill('red');
    await expect(page.locator('text=Pure Red').first()).toBeVisible();

    await searchInput.fill('blue');
    await expect(page.locator('text=Pure Blue').first()).toBeVisible();
  });

  test('search is case insensitive', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search colors/i);

    await searchInput.fill('CRIMSON');
    await expect(page.locator('text=Crimson')).toBeVisible();
  });

  test('partial search matches work', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search colors/i);

    await searchInput.fill('pur');
    await expect(page.locator('text=Pure Red').first()).toBeVisible();
  });

  test('clearing search restores all colors', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search colors/i);

    await searchInput.fill('crimson');
    await expect(page.locator('text=Crimson')).toBeVisible();

    await searchInput.fill('');
    await expect(page.locator('text=238 colors').first()).toBeVisible();
  });

  test('hex search finds colors', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search colors/i);

    await searchInput.fill('#FF0000');
    await expect(page.locator('text=Pure Red').first()).toBeVisible();
  });
});
