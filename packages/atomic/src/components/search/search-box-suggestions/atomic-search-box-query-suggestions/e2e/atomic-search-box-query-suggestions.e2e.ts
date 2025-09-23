import type AxeBuilder from '@axe-core/playwright';
import type {Page} from '@playwright/test';
import {expect, test} from './fixture';
import type {AtomicSearchBoxQuerySuggestionsPageObject} from './page-object';

test.describe('atomic-search-box-query-suggestions', () => {
  test.beforeEach(
    async ({
      searchBoxQuerySuggestions,
      page,
    }: {
      searchBoxQuerySuggestions: AtomicSearchBoxQuerySuggestionsPageObject;
      page: Page;
    }) => {
      await searchBoxQuerySuggestions.load();
      await page.locator('atomic-search-box').waitFor();
    }
  );

  test('should be accessible', async ({
    makeAxeBuilder,
  }: {
    makeAxeBuilder: () => AxeBuilder;
  }) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should render within a search box', async ({page}: {page: Page}) => {
    const searchBox = page.locator('atomic-search-box');
    const querySuggestions = page.locator(
      'atomic-search-box-query-suggestions'
    );

    await expect(searchBox).toBeVisible();
    await expect(querySuggestions).toBeAttached();
  });
});
