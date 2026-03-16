import {expect, test} from '@playwright/test';

test.describe('Search Page', () => {
  test('should load the search page without errors', async ({page}) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Coveo Headless React Samples/);
  });

  test('should display navigation links', async ({page}) => {
    await page.goto('/');
    await expect(page.getByRole('link', {name: 'Search'})).toBeVisible();
  });
});
