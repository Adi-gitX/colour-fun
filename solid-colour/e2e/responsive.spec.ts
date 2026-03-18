import { test, expect } from '@playwright/test';

test.describe('Responsive Layout', () => {
  test('mobile viewport renders the app correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('text=All Colors')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('tablet viewport renders the app correctly', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'All Colors' })).toBeVisible();
  });

  test('desktop viewport renders the app correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.locator('text=All Colors')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('search input is accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const searchInput = page.getByPlaceholder(/search colors/i);
    await expect(searchInput).toBeVisible();
  });
});
