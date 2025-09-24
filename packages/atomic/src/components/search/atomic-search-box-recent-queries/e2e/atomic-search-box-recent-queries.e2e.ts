import {expect, test} from './fixture.js';

test.describe('atomic-search-box-recent-queries', () => {
  test.beforeEach(async ({searchBoxRecentQueries, page}) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'coveo-recent-queries',
        JSON.stringify(['test query', 'another search', 'third search'])
      );
    });
    await searchBoxRecentQueries.load();
    await page.locator('atomic-search-box').waitFor();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should display recent queries from localStorage', async ({
    searchBoxRecentQueries,
    page,
  }) => {
    await page.locator('atomic-search-box input').click();

    await expect(searchBoxRecentQueries.recentQuery).toHaveCount(3);

    await expect(searchBoxRecentQueries.recentQuery.first()).toContainText(
      'test query'
    );
  });

  test('when clicking a recent query, it should execute the search', async ({
    searchBoxRecentQueries,
    page,
  }) => {
    await page.locator('atomic-search-box input').click();

    await searchBoxRecentQueries.recentQuery.first().click();

    await expect(page.locator('atomic-search-box input')).toHaveValue(
      'test query'
    );
  });

  test('when clicking clear recent queries, it should clear the recent queries', async ({
    searchBoxRecentQueries,
    page,
  }) => {
    await page.locator('atomic-search-box input').click();

    await expect(searchBoxRecentQueries.recentQuery).toHaveCount(3);

    await searchBoxRecentQueries.clearButton.click();

    await expect(searchBoxRecentQueries.recentQuery).toHaveCount(0);
  });

  test('should limit the number of displayed queries based on maxWithQuery', async ({
    searchBoxRecentQueries,
    page,
  }) => {
    await searchBoxRecentQueries.load({
      args: {
        maxWithQuery: 2,
      },
    });
    await page.locator('atomic-search-box').waitFor();

    await page.locator('atomic-search-box input').fill('t');

    const visibleQueries = searchBoxRecentQueries.recentQuery.filter({
      hasText: 't',
    });
    await expect(visibleQueries).toHaveCount(2);
  });

  test('should filter recent queries based on current input', async ({
    searchBoxRecentQueries,
    page,
  }) => {
    await page.locator('atomic-search-box input').click();

    await page.locator('atomic-search-box input').fill('test');

    await expect(searchBoxRecentQueries.recentQuery).toHaveCount(1);
    await expect(searchBoxRecentQueries.recentQuery.first()).toContainText(
      'test query'
    );
  });
});
