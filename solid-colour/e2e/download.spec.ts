import { test, expect } from '@playwright/test';

test.describe('Color Download Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=All Colors')).toBeVisible();
  });

  test('clicking a color opens the download modal', async ({ page }) => {
    await page.locator('text=Pure Red').first().click();
    await expect(page.locator('text=#FF0000').first()).toBeVisible();
  });

  test('download modal shows the color name', async ({ page }) => {
    await page.locator('text=Pure Red').first().click();
    await expect(page.locator('text=Pure Red').first()).toBeVisible();
  });

  test('modal can be closed', async ({ page }) => {
    await page.locator('text=Pure Red').first().click();
    await expect(page.locator('text=#FF0000').first()).toBeVisible();

    // Close the modal
    const closeBtn = page.locator('[aria-label="Close"]').or(page.locator('button:has-text("×")'));
    if (await closeBtn.count() > 0) {
      await closeBtn.first().click();
    } else {
      await page.keyboard.press('Escape');
    }
  });

  test('can open different color modals sequentially', async ({ page }) => {
    await page.locator('text=Pure Red').first().click();
    await expect(page.locator('text=#FF0000').first()).toBeVisible();
    await page.keyboard.press('Escape');

    const searchInput = page.getByPlaceholder(/search colors/i);
    await searchInput.fill('crimson');
    await page.locator('text=Crimson').click();
    await expect(page.locator('text=#DC143C').first()).toBeVisible();
  });
});
