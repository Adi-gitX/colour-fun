import { test, expect } from '@playwright/test';

// Smoke tests — keep this suite small, fast, and tied to invariants the
// app guarantees forever (title, root mount, no console errors). Specific
// feature tests should live in their own spec files.

test.describe('app smoke', () => {
  test('home page loads with the Stax title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Stax/);
  });

  test('react root renders content', async ({ page }) => {
    await page.goto('/');
    const root = page.locator('#root');
    await expect(root).toBeVisible();
    // Ensure something actually rendered into root, not just an empty div.
    await expect(root).not.toBeEmpty();
  });

  test('no uncaught console errors on initial load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known-noisy third-party messages if any creep in.
    const real = errors.filter(
      (e) => !/Failed to load resource.*sw\.js/i.test(e),
    );
    expect(real).toEqual([]);
  });
});
