import { test, expect } from '@playwright/test';

test.describe('colour-fun App E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('page loads with correct title and branding', async ({ page }) => {
        // Check page title
        await expect(page).toHaveTitle(/colour-fun|Vite/i);

        // Check header branding
        await expect(page.locator('text=colour-fun').first()).toBeVisible();

        // Check footer
        await expect(page.locator('text=Premium Color Assets')).toBeVisible();
    });

    test('color grid renders with color cards', async ({ page }) => {
        // Wait for the grid to load
        await expect(page.locator('text=All Colors')).toBeVisible();
        await expect(page.locator('text=238 colors')).toBeVisible();

        // Verify some colors are visible
        await expect(page.locator('text=Pure Red').first()).toBeVisible();
    });

    test('search filters colors correctly', async ({ page }) => {
        // Wait for grid
        await expect(page.locator('text=238 colors')).toBeVisible();

        // Type search query
        const searchInput = page.getByPlaceholder(/search colors/i);
        await searchInput.fill('crimson');

        // Should filter to a small number of results
        await expect(page.locator('text=Crimson')).toBeVisible();

        // Clear search
        await searchInput.fill('');

        // Should show all colors again
        await expect(page.locator('text=238 colors')).toBeVisible();
    });

    test('clicking a color card opens download modal', async ({ page }) => {
        // Wait for grid
        await expect(page.locator('text=All Colors')).toBeVisible();

        // Click on a color card (Pure Red)
        await page.locator('text=Pure Red').first().click();

        // Download modal should appear with the color info
        await expect(page.locator('text=#FF0000').first()).toBeVisible();
    });

    test('theme toggle switches between dark and light', async ({ page }) => {
        // Get current data-theme
        const initialTheme = await page.locator('html').getAttribute('data-theme');

        // Click theme toggle
        await page.getByLabel(/toggle theme/i).click();

        // Theme should have changed
        const newTheme = await page.locator('html').getAttribute('data-theme');
        expect(newTheme).not.toBe(initialTheme);

        // Toggle back
        await page.getByLabel(/toggle theme/i).click();
        const restoredTheme = await page.locator('html').getAttribute('data-theme');
        expect(restoredTheme).toBe(initialTheme);
    });

    test('search with no results shows empty state', async ({ page }) => {
        // Wait for grid
        await expect(page.locator('text=All Colors')).toBeVisible();

        // Type non-matching query
        const searchInput = page.getByPlaceholder(/search colors/i);
        await searchInput.fill('xyznonexistent');

        // Should show empty state
        await expect(page.locator('text=No colors found')).toBeVisible();
    });
});
