import {expect, test} from '@playwright/test';

test.describe('Headless commerce sample', () => {
  test('shows the sample search box and recommendations on the home page', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', {name: 'Home'})).toBeVisible();
    await expect(page.getByLabel('Enter query')).toBeVisible();
    await expect(page.locator('.ProductList').first()).toBeVisible();
  });

  test('can search and display products with generated facets', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByLabel('Enter query').fill('kayak');
    await page.getByRole('button', {name: 'Submit query'}).click();

    await expect(page).toHaveURL(/\/search/);
    await expect(page.getByRole('heading', {name: 'Search'})).toBeVisible();
    await expect(page.locator('.ResultList')).toBeVisible();
    await expect(page.locator('.Facets')).toBeVisible();
  });

  test('can navigate to a product listing page', async ({page}) => {
    await page.goto('/');
    await page.getByLabel('Surf Accessories').check();

    await expect(page).toHaveURL(/\/listing\/surf-accessories/);
    await expect(
      page.getByRole('heading', {name: 'Surf Accessories'})
    ).toBeVisible();
    await expect(page.locator('.ResultList')).toBeVisible();
  });
});
