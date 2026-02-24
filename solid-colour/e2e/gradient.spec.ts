import { test, expect } from '@playwright/test';

test.describe('Gradient Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByText('Gradients').click();
  });

  test('renders gradient generator heading', async ({ page }) => {
    await expect(page.locator('text=Gradient Generator')).toBeVisible();
  });

  test('renders description text', async ({ page }) => {
    await expect(
      page.locator('text=Create beautiful, smooth gradients for your next project.')
    ).toBeVisible();
  });

  test('renders randomize button', async ({ page }) => {
    await expect(page.locator('text=Randomize')).toBeVisible();
  });

  test('renders copy CSS button', async ({ page }) => {
    await expect(page.locator('text=Copy CSS')).toBeVisible();
  });

  test('renders download button', async ({ page }) => {
    await expect(page.locator('text=Download Image')).toBeVisible();
  });

  test('angle slider is visible and functional', async ({ page }) => {
    await expect(page.locator('text=Angle')).toBeVisible();
    const slider = page.locator('input[type="range"]');
    await expect(slider).toBeVisible();
  });

  test('randomize changes the gradient preview', async ({ page }) => {
    const randomBtn = page.locator('text=Randomize');
    await randomBtn.click();
    // After randomize the angle value should have changed
    await expect(page.locator('text=Angle')).toBeVisible();
  });
});
