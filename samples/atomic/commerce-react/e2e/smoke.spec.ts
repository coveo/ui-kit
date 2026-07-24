import {expect, test} from './fixtures.js';

test('home page renders recommendations and a search box', async ({page}) => {
  await page.goto('/');

  await expect(page.locator('atomic-commerce-search-box')).toBeVisible();
  const recommendationLists = page.locator('atomic-commerce-recommendation-list');
  await expect(recommendationLists).toHaveCount(2);
  await expect(recommendationLists.first()).toBeVisible();
});

test('search page renders the commerce search experience', async ({page}) => {
  await page.goto('/search');

  await expect(page.locator('atomic-commerce-search-box')).toBeVisible();
  await expect(page.locator('atomic-commerce-facets')).toBeVisible();
  await expect(page.locator('atomic-commerce-product-list')).toBeVisible();
});

for (const listing of ['surf-accessories', 'toys']) {
  test(`${listing} listing renders products and a search box`, async ({page}) => {
    await page.goto(`/listing/${listing}`);

    await expect(page.locator('atomic-commerce-search-box')).toBeVisible();
    await expect(page.locator('atomic-commerce-product-list')).toBeVisible();
    await expect(page.locator('atomic-commerce-facets')).toBeVisible();
    const querySummary = page.locator('atomic-commerce-query-summary');
    await expect(querySummary).toContainText(/Products? \d+(?:-\d+)? of \d+/);
    await expect(querySummary).not.toContainText('showing-products-of');
  });
}
