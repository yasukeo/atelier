import { test, expect } from '@playwright/test'

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('img', { name: /next\.js logo/i })).toBeVisible();
});
