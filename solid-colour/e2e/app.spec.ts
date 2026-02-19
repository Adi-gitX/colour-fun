import { test, expect } from '@playwright/test';

test.describe('colour-fun App E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('page loads with correct title and branding', async ({ page }) => {
        await expect(page).toHaveTitle(/colour-fun|Vite/i);
        // Verify footer branding is visible (header & sidebar logos animate in)
        await expect(page.locator('footer')).toBeVisible();
        await expect(page.locator('text=Premium Color Assets')).toBeVisible();
        await expect(page.locator('text=v1.2.0')).toBeVisible();
    });

    test('color grid renders with color cards', async ({ page }) => {
        await expect(page.locator('text=All Colors')).toBeVisible();
        // Use the grid-specific count (lowercase 'colors')
        await expect(page.locator('text=238 colors').first()).toBeVisible();
        await expect(page.locator('text=Pure Red').first()).toBeVisible();
    });

    test('search filters colors correctly', async ({ page }) => {
        // Wait for grid to load
        await expect(page.locator('text=All Colors')).toBeVisible();

        const searchInput = page.getByPlaceholder(/search colors/i);
        await searchInput.fill('crimson');

        await expect(page.locator('text=Crimson')).toBeVisible();

        // Clear search
        await searchInput.fill('');

        // Should show all colors again
        await expect(page.locator('text=All Colors')).toBeVisible();
    });

    test('clicking a color card opens download modal', async ({ page }) => {
        await expect(page.locator('text=All Colors')).toBeVisible();

        await page.locator('text=Pure Red').first().click();

        // Download modal should show the color hex
        await expect(page.locator('text=#FF0000').first()).toBeVisible();
    });

    test('theme toggle switches between dark and light', async ({ page }) => {
        const initialTheme = await page.locator('html').getAttribute('data-theme');

        await page.getByLabel(/toggle theme/i).click();

        const newTheme = await page.locator('html').getAttribute('data-theme');
        expect(newTheme).not.toBe(initialTheme);

        await page.getByLabel(/toggle theme/i).click();
        const restoredTheme = await page.locator('html').getAttribute('data-theme');
        expect(restoredTheme).toBe(initialTheme);
    });

    test('search with no results shows empty state', async ({ page }) => {
        await expect(page.locator('text=All Colors')).toBeVisible();

        const searchInput = page.getByPlaceholder(/search colors/i);
        await searchInput.fill('xyznonexistent');

        await expect(page.locator('text=No colors found')).toBeVisible();
    });
});
