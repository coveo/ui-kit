import {expect, test} from '@playwright/test';

test.describe('Home Page', () => {
  test('should load and display the search box', async ({page}) => {
    await page.goto('/');
    const searchBox = page.getByLabel('Enter query');
    await expect(searchBox).toBeVisible();
  });

  test('should perform a search and display products', async ({page}) => {
    await page.goto('/');
    const searchBox = page.getByLabel('Enter query');
    await searchBox.press('Enter');

    const productList = page.locator('css=.ProductList');
    await expect(productList).toBeVisible();

    const productItems = await productList.getByRole('listitem').all();
    expect(productItems.length).toBeGreaterThan(0);
  });

  test('should display the facets', async ({page}) => {
    await page.goto('/');
    const searchBox = page.getByLabel('Enter query');
    await searchBox.press('Enter');

    const facetsSection = page.getByLabel('Brand');
    await expect(facetsSection).toBeVisible();
  });
});
