import {expect, test} from '@playwright/test';
import {createSearchPage} from './search.page.js';

test.describe('SSR Search Sample', () => {
  test('should load and render the search interface', async ({page}) => {
    const search = createSearchPage(page);
    await search.goto();
    await expect(page).toHaveTitle(/SSR Search/);
    await expect(search.searchInput).toBeVisible();
    await expect(search.resultList).toBeVisible();
    await expect(search.results.first()).toBeVisible();
  });

  test('should allow searching', async ({page}) => {
    const search = createSearchPage(page);
    await search.goto();
    await page.waitForLoadState('networkidle');

    await search.searchFor('machine');

    await expect(page).toHaveURL(/\?q=machine/);
    await expect(search.results.first()).toBeVisible();
  });
});
