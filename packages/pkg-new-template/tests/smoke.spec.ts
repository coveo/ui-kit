import {expect, test} from '@playwright/test';

test.describe('smoke test', () => {
  test.use({viewport: {width: 2000, height: 2000}});

  test('Search Page', async ({page}) => {
    await page.goto('http://localhost:3000/search.html');

    await expect(page.locator('atomic-search-box')).toBeVisible();
    await expect(page.locator('atomic-result-list')).toBeVisible();
    await expect(page.locator('atomic-facet').first()).toBeVisible();
  });

  test('Commerce Search Page', async ({page}) => {
    await page.goto('http://localhost:3000/commerce.html');

    await expect(page.locator('atomic-commerce-search-box')).toBeVisible();
    await expect(page.locator('atomic-commerce-product-list')).toBeVisible();
    await expect(page.locator('atomic-commerce-facets')).toBeVisible();
  });

  test('Insight Page', async ({page}) => {
    await page.goto('http://localhost:3000/insight.html');

    await expect(page.locator('atomic-insight-search-box')).toBeVisible();
    await expect(page.locator('atomic-insight-result-list')).toBeVisible();
    await expect(page.locator('atomic-insight-tab').first()).toBeVisible();
  });
});
