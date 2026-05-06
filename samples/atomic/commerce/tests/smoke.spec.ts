import {expect, test} from '@playwright/test';

test.describe('Atomic Commerce Sample', () => {
  test('search page loads and displays products', async ({page}) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3001/search.html');

    const searchBox = page.locator('atomic-commerce-search-box');
    await expect(searchBox).toBeVisible();

    const querySummary = page.locator('atomic-commerce-query-summary');
    await querySummary.waitFor();
    await querySummary.locator('div[part="container"]').waitFor();

    const productList = page.locator('atomic-commerce-product-list');
    await expect(productList).toBeVisible();

    const firstProduct = productList.locator('atomic-product').first();
    await expect(firstProduct).toBeVisible();

    const filteredErrors = consoleErrors.filter(
      (error) => !error.includes('MissingInterfaceParentError')
    );
    expect(filteredErrors).toEqual([]);
  });

  test('listing page loads and displays products', async ({page}) => {
    await page.goto('http://localhost:3001/listing.html');

    const productList = page.locator('atomic-commerce-product-list');
    await expect(productList).toBeVisible();

    const firstProduct = productList.locator('atomic-product').first();
    await expect(firstProduct).toBeVisible();
  });

  test('recommendations page loads', async ({page}) => {
    await page.goto('http://localhost:3001/recommendations.html');

    const recsList = page.locator('atomic-commerce-recommendation-list');
    await expect(recsList).toBeVisible();
  });
});
