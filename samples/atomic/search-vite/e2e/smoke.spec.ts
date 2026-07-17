import {expect, test} from './fixtures.js';

test('should load and render the search experience', async ({page}) => {
  await page.goto('/');

  await expect(page.locator('atomic-search-box')).toBeVisible();
  await expect(page.locator('atomic-facet').first()).toBeVisible();
  await expect(page.locator('atomic-result-list')).toBeVisible();
});
