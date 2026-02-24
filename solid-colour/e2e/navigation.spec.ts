import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('sidebar shows navigation items', async ({ page }) => {
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
  });

  test('clicking Gradients navigates to gradient section', async ({ page }) => {
    await page.getByText('Gradients').click();
    await expect(page.locator('text=Gradient Generator')).toBeVisible();
  });

  test('clicking Backgrounds shows coming soon', async ({ page }) => {
    await page.getByText('Backgrounds').click();
    await expect(page.locator('text=Background Images')).toBeVisible();
  });

  test('clicking UI Themes shows coming soon', async ({ page }) => {
    await page.getByText('UI Themes').click();
    await expect(page.locator('text=UI Themes')).toBeVisible();
  });

  test('clicking Solid Colors returns to color grid', async ({ page }) => {
    await page.getByText('Gradients').click();
    await expect(page.locator('text=Gradient Generator')).toBeVisible();

    await page.getByText('Solid Colors').click();
    await expect(page.locator('text=All Colors')).toBeVisible();
  });

  test('footer shows branding on every section', async ({ page }) => {
    await expect(page.locator('footer')).toBeVisible();

    await page.getByText('Gradients').click();
    await expect(page.locator('footer')).toBeVisible();
  });
});
