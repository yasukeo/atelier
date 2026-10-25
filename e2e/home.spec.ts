import { test, expect } from '@playwright/test'

test('home page loads and links to the gallery', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Elwarcha')
  await page.getByRole('link', { name: 'Voir les œuvres' }).click()
  await expect(page).toHaveURL(/\/paintings/)
  await expect(page.getByRole('heading', { name: 'Galerie' })).toBeVisible()
})
