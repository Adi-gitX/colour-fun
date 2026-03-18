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
    await page.getByRole('button', { name: 'Gradients' }).click();
    await expect(page.locator('text=Gradient Generator')).toBeVisible();
  });

  test('clicking Backgrounds shows coming soon', async ({ page }) => {
    await page.getByRole('button', { name: 'Backgrounds' }).click();
    await expect(page.getByRole('heading', { name: 'Background Images' })).toBeVisible();
  });

  test('clicking UI Themes shows coming soon', async ({ page }) => {
    await page.getByRole('button', { name: 'UI Themes' }).click();
    await expect(page.getByRole('heading', { name: 'UI Themes' })).toBeVisible();
  });

  test('clicking Solid Colors returns to color grid', async ({ page }) => {
    await page.getByRole('button', { name: 'Gradients' }).click();
    await expect(page.locator('text=Gradient Generator')).toBeVisible();

    await page.getByRole('button', { name: 'Solid Colors' }).click();
    await expect(page.getByRole('heading', { name: 'All Colors' })).toBeVisible();
  });

  test('footer shows branding on every section', async ({ page }) => {
    await expect(page.locator('footer')).toBeVisible();

    await page.getByRole('button', { name: 'Gradients' }).click();
    await expect(page.locator('footer')).toBeVisible();
  });
});
