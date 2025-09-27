import {expect, setRecentQueries, test} from './fixture.js';

test.describe('atomic-search-box-recent-queries', () => {
  test.beforeEach(async ({searchBoxRecentQueries}) => {
    await searchBoxRecentQueries.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should display recent queries from localStorage', async ({
    searchBoxRecentQueries,
    page,
  }) => {
    await setRecentQueries(page, [
      'test query',
      'another search',
      'third search',
    ]);
    await page.reload();
    await searchBoxRecentQueries.searchInput.waitFor({state: 'visible'});
    await searchBoxRecentQueries.searchInput.click();

    await expect(searchBoxRecentQueries.recentQuery).toHaveCount(3);
    await expect(searchBoxRecentQueries.recentQuery.first()).toContainText(
      'test query'
    );
  });

  test('when clicking a recent query, it should execute the search', async ({
    searchBoxRecentQueries,
    page,
  }) => {
    await setRecentQueries(page, ['test query']);
    await page.reload();
    await searchBoxRecentQueries.searchInput.waitFor({state: 'visible'});
    await searchBoxRecentQueries.searchInput.click();
    await searchBoxRecentQueries.recentQuery.first().click();
    await expect(searchBoxRecentQueries.searchInput).toHaveValue('test query');
  });

  test('when clicking clear recent queries, it should clear the recent queries', async ({
    searchBoxRecentQueries,
    page,
  }) => {
    await setRecentQueries(page, [
      'test query',
      'another search',
      'third search',
    ]);
    await page.reload();
    await searchBoxRecentQueries.searchInput.waitFor({state: 'visible'});
    await searchBoxRecentQueries.searchInput.click();

    await expect(searchBoxRecentQueries.recentQuery).toHaveCount(3);
    await searchBoxRecentQueries.clearButton.click();
    await expect(searchBoxRecentQueries.recentQuery).toHaveCount(0);
  });

  test('should filter recent queries based on current input', async ({
    searchBoxRecentQueries,
    page,
  }) => {
    await setRecentQueries(page, [
      'test query',
      'another search',
      'third search',
    ]);
    await page.reload();
    await searchBoxRecentQueries.searchInput.waitFor({state: 'visible'});
    await searchBoxRecentQueries.searchInput.fill('test');
    await expect(searchBoxRecentQueries.recentQuery).toHaveCount(1);
    await expect(searchBoxRecentQueries.recentQuery.first()).toContainText(
      'test query'
    );
  });

  test.describe('with maxWithQuery limit', () => {
    test.beforeEach(async ({searchBoxRecentQueries, page}) => {
      await setRecentQueries(page, [
        'test query',
        'another search',
        'third search',
      ]);
      await page.reload();

      await searchBoxRecentQueries.load({
        args: {
          maxWithQuery: 2,
        },
      });

      await searchBoxRecentQueries.searchInput.waitFor({state: 'visible'});
      await searchBoxRecentQueries.searchInput.fill('t');
    });

    test('should limit the number of displayed queries based on maxWithQuery', async ({
      searchBoxRecentQueries,
    }) => {
      const visibleQueries = searchBoxRecentQueries.recentQuery.filter({
        hasText: 't',
      });
      await expect(visibleQueries).toHaveCount(2);
    });
  });
});
