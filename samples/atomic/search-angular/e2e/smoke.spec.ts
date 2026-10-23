import {expect, test} from './fixtures.js';

test('should load and render the search experience', async ({page}) => {
  await page.goto('/');

  await expect(page.locator('atomic-search-box')).toBeVisible();
  await expect(page.locator('atomic-facet').first()).toBeVisible();
  const resultList = page.locator('atomic-result-list');
  await expect(resultList).toBeVisible();
  // The custom result template renders each result's title and excerpt.
  await expect(resultList).toContainText('Sample Result 0');
  await expect(resultList).toContainText('This is a sample result excerpt for testing.');
});
