import {expect, test} from '@playwright/test';
import {createSearchPage} from './search.page.js';

test.describe('Commerce SSR Sample', () => {
  test('should load and render the search interface', async ({page}) => {
    const search = createSearchPage(page);
    await search.goto();
    await expect(page).toHaveTitle(/SSR Commerce Search/);
    await expect(search.searchInput).toBeVisible();
    await expect(search.productGrid).toBeVisible();
    await expect(search.products.first()).toBeVisible();
  });

  test('should allow searching for products', async ({page}) => {
    const search = createSearchPage(page);
    await search.goto();
    await page.waitForLoadState('networkidle');

    const initialText = await search.searchSummary.textContent();
    await search.searchFor('shoes');

    await expect(page).toHaveURL(/\?q=shoes/);
    const finalText = await search.searchSummary.textContent();

    expect(finalText).not.toBe(initialText);
    const searchWasPerformed =
      finalText?.includes('shoes') || finalText !== initialText;
    expect(searchWasPerformed).toBe(true);
  });
});
