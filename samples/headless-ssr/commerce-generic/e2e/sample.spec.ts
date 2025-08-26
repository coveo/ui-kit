import {expect, test} from '@playwright/test';

test.describe('Commerce SSR Sample', () => {
  test('should load and render the search interface', async ({page}) => {
    // Start the server first (this assumes the server is running)
    await page.goto('http://localhost:3000');

    // Check that the page title is correct
    await expect(page).toHaveTitle(/SSR Commerce Search/);

    // Check that the search input is present (it's type="text", not "search")
    const searchInput = page.locator('#search-input');
    await expect(searchInput).toBeVisible();

    // Check that products are rendered on the initial load
    const productGrid = page.locator('#product-grid');
    await expect(productGrid).toBeVisible();

    // Check that at least one product is displayed
    const products = page.locator('.product-card');
    await expect(products.first()).toBeVisible();
  });

  test('should allow searching for products', async ({page}) => {
    await page.goto('http://localhost:3000');

    // Wait for the page to fully load and JavaScript to initialize
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Give time for client-side hydration

    // Get the initial query summary text
    const searchSummary = page.locator('#query-summary');
    const initialText = await searchSummary.textContent();
    console.log('Initial search summary:', initialText);

    // Find the search input and clear it, then type a query
    const searchInput = page.locator('#search-input');
    await searchInput.clear();
    await searchInput.fill('shoes');

    // Click the search button
    const searchButton = page.locator('#search-button');
    await searchButton.click();

    // Wait for the search to complete
    await page.waitForTimeout(2000);

    // Check the final text
    const finalText = await searchSummary.textContent();
    console.log('Final search summary:', finalText);

    // Verify that search was performed (text should change and include the search term or show different results)
    expect(finalText).not.toBe(initialText);

    // Verify that either the search term appears or the result count changed
    const searchWasPerformed =
      finalText?.includes('shoes') || finalText !== initialText;
    expect(searchWasPerformed).toBe(true);
  });
});
