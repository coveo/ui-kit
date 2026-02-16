import {expect, test} from './fixture';

test.describe('atomic-commerce-search-box-recent-queries', () => {
  test.beforeEach(async ({commerceSearchBoxRecentQueries, page}) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'coveo-recent-queries',
        JSON.stringify(['test-value'])
      );
    });
    await commerceSearchBoxRecentQueries.load();
    await page.locator('atomic-commerce-search-box').waitFor();
  });

  test('when clicking a recent query, it should hide the suggestions', async ({
    commerceSearchBoxRecentQueries,
  }) => {
    await commerceSearchBoxRecentQueries.recentQuery.first().click();
    await expect(
      commerceSearchBoxRecentQueries.recentQuery.first()
    ).not.toBeVisible();
  });

  test('when clicking clear recent queries, it should clear the recent queries', async ({
    commerceSearchBoxRecentQueries,
  }) => {
    await commerceSearchBoxRecentQueries.clearButton.click();
    await expect(commerceSearchBoxRecentQueries.recentQuery).toHaveCount(0);
  });
});
