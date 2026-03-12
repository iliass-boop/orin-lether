import { test, expect } from '@playwright/test';

test('homepage loads and displays hero video', async ({ page }) => {
  await page.goto('/');
  
  // Expect title to contain Orin Leather
  await expect(page).toHaveTitle(/Orin Leather/);

  // Expect the hero section to be visible
  const heroVideo = page.locator('video[autoPlay]');
  await expect(heroVideo).toBeVisible();
  
  // Wait for preloader to finish (curtain reveals the page)
  // By default, the preloader adds overflow:hidden to body, so we wait for it to be removed.
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden', { timeout: 10000 });
});

test('navigation links work correctly', async ({ page }) => {
  await page.goto('/');
  
  // Wait for preloader to clear
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden', { timeout: 10000 });
  
  // Click on Shop link
  await page.getByRole('link', { name: 'Shop' }).first().click();
  
  // Verify URL changes to /products
  await expect(page).toHaveURL(/.*\/products/);
  
  // Ensure the product grid loads
  await expect(page.locator('h1').filter({ hasText: 'The Collection' })).toBeVisible();
});

test('cart drawer opens and closes', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden', { timeout: 10000 });

  // Open cart
  await page.getByRole('button', { name: 'Open cart' }).click();
  
  // Ensure drawer is visible
  const cartDrawer = page.getByRole('dialog', { name: 'Shopping cart' });
  await expect(cartDrawer).toBeVisible();
  
  // Expect empty state
  await expect(page.getByText('Your cart is empty')).toBeVisible();
  
  // Close cart
  await page.getByRole('button', { name: 'Close cart' }).click();
  await expect(cartDrawer).not.toBeVisible();
});
