import {expect, test} from './fixture';

test.describe('atomic-search-box-recent-queries', () => {
  test('should be accessible', async ({
    searchBoxRecentQueries,
    makeAxeBuilder,
  }) => {
    await searchBoxRecentQueries.load();
    await searchBoxRecentQueries.page.waitForTimeout(1000);
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });
});
