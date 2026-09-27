import { test, expect, type Page } from '@playwright/test';

// The three sections of the top-bar shell: the Ask thread, Libraries, and the Wallpapers tabs.
// Third-party image hosts are blocked so the suite does not depend on them from a CI runner.

async function open(page: Page, path = '/') {
  await page.route(
    /opengraph\.githubassets\.com|api\.microlink\.io|picsum\.photos|assets\.lummi\.ai|generativelanguage\.googleapis\.com/,
    (route) => route.abort()
  );
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

test.describe('ask thread', () => {
  test('starts empty, then shows the request and result cards', async ({ page }) => {
    await open(page);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Describe it');
    // The composer floats as a collapsed pill on the landing page; opening it and sending starts the thread.
    await page.getByRole('button', { name: 'Open prompt input' }).click();
    await page.getByLabel('What do you need?').fill('a loader for a checkout page');
    await page.keyboard.press('Enter');
    // The request is echoed as a message, then answered with cards carrying an install tab.
    await expect(page.getByText('a loader for a checkout page').first()).toBeVisible();
    await expect(page.locator('article').first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('tab', { name: 'Install' }).first()).toBeVisible();
    // A second question appends to the same thread.
    await page.getByLabel('What do you need?').fill('a pricing table');
    await page.keyboard.press('Enter');
    await expect(page.locator('article')).toHaveCount(16, { timeout: 30_000 });
    await page.getByRole('button', { name: 'New thread' }).click();
    await expect(page.locator('article')).toHaveCount(0);
  });
});

test.describe('libraries', () => {
  test('lists every library with a status badge', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Libraries', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Libraries' })).toBeVisible();
    await expect(page.getByText('Indexed', { exact: true }).first()).toBeVisible();
    await expect(page.locator('article').first()).toBeVisible();
  });
});

test.describe('wallpapers', () => {
  test('switches between solid, gradients and images with tabs', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Wallpapers', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Solid colours' })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Solid/ })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('tab', { name: /Gradients/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Gradients' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Copy CSS' })).toBeVisible();
    await page.getByRole('tab', { name: /Images/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Images' })).toBeVisible();
  });

  test('filters solid colours by name', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Wallpapers', exact: true }).click();
    await page.getByLabel('Filter colours').fill('crimson');
    await expect(page.getByText('Crimson', { exact: true })).toBeVisible();
    await expect(page.getByText('Pure Red', { exact: true })).toHaveCount(0);
  });
});

test.describe('mobile shell', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('folds the nav into a menu sheet', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible();
    await page.getByRole('button', { name: /^Gradients/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Gradients' })).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Menu' })).toHaveCount(0);
  });
});
