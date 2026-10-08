import {expect, test} from './fixtures.js';

test('renders the search page with results', async ({page}) => {
  await page.goto('/');

  await expect(page.locator('atomic-search-box')).toBeVisible();
  await expect(page.locator('atomic-facet').first()).toBeVisible();
  const resultList = page.locator('atomic-result-list');
  await expect(resultList).toContainText('Sample Result 0');
  await expect(resultList).toContainText('This is a sample result excerpt for testing.');
  await expect(page.locator('atomic-component-error')).toHaveCount(0);
});
