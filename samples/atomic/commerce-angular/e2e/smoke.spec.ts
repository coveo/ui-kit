import {expect, test} from './fixtures.js';

test('home page renders recommendations and a search box', async ({page}) => {
  await page.goto('/');

  await expect(page.locator('atomic-commerce-search-box')).toBeVisible();
  const recommendationLists = page.locator('atomic-commerce-recommendation-list');
  await expect(recommendationLists).toHaveCount(2);
  for (const recommendationList of await recommendationLists.all()) {
    await expect(recommendationList.locator('atomic-product').first()).toBeVisible();
  }
  await expect(page.locator('atomic-component-error')).toHaveCount(0);
});

test('search page renders products', async ({page}) => {
  await page.goto('/search');

  await expect(page.locator('atomic-commerce-search-box')).toBeVisible();
  await expect(page.locator('atomic-commerce-facets')).toBeVisible();
  await expect(page.locator('atomic-commerce-product-list atomic-product').first()).toBeVisible();
  await expect(page.locator('atomic-component-error')).toHaveCount(0);
});

for (const {path, heading} of [
  {path: '/listing/surf-accessories', heading: 'Surf Accessories'},
  {path: '/listing/toys', heading: 'Toys'},
]) {
  test(`${heading} listing renders products`, async ({page}) => {
    await page.goto(path);

    await expect(page.getByRole('heading', {name: heading})).toBeVisible();
    await expect(page.locator('atomic-commerce-search-box')).toBeVisible();
    await expect(page.locator('atomic-commerce-facets')).toBeVisible();
    await expect(page.locator('atomic-commerce-query-summary')).toContainText(
      /Products? \d+(?:-\d+)? of \d+/
    );
    await expect(page.locator('atomic-commerce-product-list atomic-product').first()).toBeVisible();
    await expect(page.locator('atomic-component-error')).toHaveCount(0);
  });
}

test('navigating between listings requests each listing view', async ({page}) => {
  await page.goto('/listing/toys');
  await expect(page.locator('atomic-commerce-product-list atomic-product').first()).toBeVisible();

  const surfAccessoriesRequest = page.waitForRequest(
    (request) =>
      request.url().endsWith('/commerce/v2/listing') &&
      request.postDataJSON().context.view.url ===
        'https://sports.barca.group/browse/promotions/surf-accessories'
  );
  await page.getByRole('link', {name: 'Surf Accessories'}).click();
  await surfAccessoriesRequest;

  await expect(page.getByRole('heading', {name: 'Surf Accessories'})).toBeVisible();
  await expect(page.locator('atomic-commerce-product-list atomic-product').first()).toBeVisible();
});
