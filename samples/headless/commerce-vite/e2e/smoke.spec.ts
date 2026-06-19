import {test, expect} from './fixtures.js';

test('should load the home page with recommendations', async ({page}) => {
  await page.goto('/');
  await expect(page.locator('.product').first()).toBeVisible();
});

test('should navigate to search and display products', async ({page}) => {
  await page.goto('/#/search');
  await expect(page.locator('#products .product').first()).toBeVisible();
});
