import {expect, test} from './fixtures.js';

test('home page renders recommendations and a search box', async ({page}) => {
  await page.goto('/index.html');

  await expect(page.locator('atomic-commerce-search-box')).toBeVisible();
  const recommendationLists = page.locator('atomic-commerce-recommendation-list');
  await expect(recommendationLists).toHaveCount(2);
  await expect(recommendationLists.first()).toBeVisible();
  await expect(recommendationLists.last()).toBeVisible();
});

test('search page renders the commerce search experience', async ({page}) => {
  await page.goto('/search.html');

  await expect(page.locator('atomic-commerce-search-box')).toBeVisible();
  await expect(page.locator('atomic-commerce-facets')).toBeVisible();
  await expect(page.locator('atomic-commerce-product-list')).toBeVisible();
});

for (const listing of ['surf-accessories', 'toys']) {
  test(`${listing} listing renders products and a search box`, async ({page}) => {
    await page.goto(`/listing-${listing}.html`);

    await expect(page.locator('atomic-commerce-search-box')).toBeVisible();
    await expect(page.locator('atomic-commerce-product-list')).toBeVisible();
    await expect(page.locator('atomic-commerce-facets')).toBeVisible();
  });
}
