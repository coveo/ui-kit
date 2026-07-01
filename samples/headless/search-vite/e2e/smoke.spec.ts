import {test, expect} from './fixtures.js';

test('should load and display search results', async ({page}) => {
  await page.goto('/');
  await expect(page.locator('#search-box input')).toBeVisible();
  await expect(page.locator('#result-list .result-item').first()).toBeVisible();
});
