import { readFileSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';

// The three sections of the top-bar shell: Ask, Sites, and the Wallpapers tabs.
// Third-party image hosts are blocked so the suite does not depend on them from a CI runner.

async function open(page: Page, path = '/') {
  await page.route(
    /opengraph\.githubassets\.com|api\.microlink\.io|picsum\.photos|assets\.lummi\.ai|generativelanguage\.googleapis\.com/,
    (route) => route.abort()
  );
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

// /api/find runs live web search on the server; the UI tests replay a recorded answer instead.
const FOOTER_ANSWER = readFileSync(new URL('./fixtures/find-footer.ndjson', import.meta.url), 'utf8');

test.describe('ask', () => {
  test('streams progress, then verified site cards, and threads follow-ups', async ({ page }) => {
    await page.route('**/api/find', (route) =>
      route.fulfill({ status: 200, contentType: 'application/x-ndjson', body: FOOTER_ANSWER })
    );
    await open(page);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Stunning');
    await page.getByRole('button', { name: 'Open prompt input' }).click();
    await page.getByLabel('What do you need?').fill('footer designs');
    await page.keyboard.press('Enter');
    await expect(page.getByText('footer designs').first()).toBeVisible();
    await expect(page.locator('article')).toHaveCount(2);
    await expect(page.getByRole('link', { name: /Visit footer\.design/ })).toHaveAttribute('href', 'https://www.footer.design/browse');
    await expect(page.getByText('Found on the web')).toBeVisible();
    await expect(page.getByText('Start with Footer Design for structure')).toBeVisible();
    // A second question appends to the same thread.
    await page.getByLabel('What do you need?').fill('pricing pages');
    await page.keyboard.press('Enter');
    await expect(page.locator('article')).toHaveCount(4);
    await page.getByRole('button', { name: 'New thread' }).click();
    await expect(page.locator('article')).toHaveCount(0);
  });

  test('shows a failure plainly and retries it', async ({ page }) => {
    let calls = 0;
    await page.route('**/api/find', (route) => {
      calls += 1;
      return calls === 1
        ? route.fulfill({ status: 500, body: 'boom' })
        : route.fulfill({ status: 200, contentType: 'application/x-ndjson', body: FOOTER_ANSWER });
    });
    await open(page);
    await page.getByRole('button', { name: 'Open prompt input' }).click();
    await page.getByLabel('What do you need?').fill('footer designs');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('alert')).toContainText('Garden answered 500');
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.locator('article')).toHaveCount(2);
  });
});

test.describe('sites', () => {
  test('lists every hand-picked site with a direct link', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Sites', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Sites' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Component libraries' })).toBeVisible();
    await expect(page.locator('article').first()).toBeVisible();
  });
});

test.describe('wallpapers', () => {
  test('opens on images, then switches to gradients and solid colours', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Wallpapers', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Images' })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Images/ })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('tab', { name: /Gradients/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Gradients' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Copy CSS' })).toBeVisible();
    await page.getByRole('tab', { name: /Solid/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Solid colours' })).toBeVisible();
  });

  test('filters solid colours by name', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Wallpapers', exact: true }).click();
    await page.getByRole('tab', { name: /Solid/ }).click();
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
