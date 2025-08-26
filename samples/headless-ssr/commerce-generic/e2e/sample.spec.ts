import {expect, test} from '@playwright/test';

test.describe('Commerce SSR Sample', () => {
  test('should load and render the search interface', async ({page}) => {
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/SSR Commerce Search/);

    const searchInput = page.locator('#search-input');
    await expect(searchInput).toBeVisible();

    const productGrid = page.locator('#product-grid');
    await expect(productGrid).toBeVisible();

    const products = page.locator('.product-card');
    await expect(products.first()).toBeVisible();
  });

  test('should allow searching for products', async ({page}) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const searchSummary = page.locator('#query-summary');
    const initialText = await searchSummary.textContent();

    const searchInput = page.locator('#search-input');
    await searchInput.clear();
    await searchInput.fill('shoes');

    const searchButton = page.locator('#search-button');
    await searchButton.click();
    await page.waitForTimeout(2000);

    const finalText = await searchSummary.textContent();

    expect(finalText).not.toBe(initialText);

    const searchWasPerformed =
      finalText?.includes('shoes') || finalText !== initialText;

    expect(searchWasPerformed).toBe(true);
  });
});
