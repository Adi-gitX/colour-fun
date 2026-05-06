import { test, expect } from '@playwright/test';

// Smoke tests — keep this suite small, fast, and tied to invariants the
// app guarantees forever (title, root mount, no console errors). Specific
// feature tests should live in their own spec files.

test.describe('app smoke', () => {
  test('home page loads with the Atlas title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Atlas/);
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

    // Block third-party image requests so the test doesn't depend on
    // opengraph.githubassets.com / api.microlink.io / picsum.photos /
    // assets.lummi.ai responding from the CI runner. The PreviewImage
    // fallback chain handles these failures at runtime — what we care
    // about in this smoke test is that *our* code doesn't throw.
    await page.route(
      /opengraph\.githubassets\.com|api\.microlink\.io|picsum\.photos|assets\.lummi\.ai|fonts\.googleapis\.com|fonts\.gstatic\.com/,
      (route) => route.abort(),
    );

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out:
    //   - service-worker registration noise that appears in non-PWA preview
    //   - "Failed to load resource: status of N" — these are external
    //     network failures (rate limits, blocked domains) not bugs in
    //     our app code; the PreviewImage fallback chain handles them.
    const real = errors.filter(
      (e) =>
        !/Failed to load resource.*sw\.js/i.test(e) &&
        !/Failed to load resource.*status of \d+/i.test(e) &&
        !/net::ERR_FAILED/i.test(e),
    );
    expect(real).toEqual([]);
  });
});
