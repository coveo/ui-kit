import {expect, test} from '@playwright/test';

test.describe('Headless Commerce Sample', () => {
  test('search page loads and displays products', async ({page}) => {
    await page.goto('http://localhost:3003/search.html');

    const querySummary = page.locator('#query-summary');
    await expect(querySummary).not.toBeEmpty({timeout: 10000});

    const products = page.locator('.product-item');
    await expect(products.first()).toBeVisible();

    const searchInput = page.locator('#search-box input');
    await searchInput.fill('shoes');
    await searchInput.press('Enter');

    await expect(querySummary).toContainText('for "shoes"');
    await expect(products.first()).toBeVisible();
  });

  test('listing page loads and displays products', async ({page}) => {
    await page.goto('http://localhost:3003/listing.html');

    const querySummary = page.locator('#query-summary');
    await expect(querySummary).not.toBeEmpty({timeout: 10000});

    const products = page.locator('.product-item');
    await expect(products.first()).toBeVisible();
  });
});
