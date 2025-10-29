import {expect, test} from './fixture';

test.describe('atomic-load-more-results', () => {
  test.beforeEach(async ({loadMore}) => {
    await loadMore.load({story: 'default'});
  });

  test('should be accessible', async ({loadMore, makeAxeBuilder}) => {
    await loadMore.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should load more results when clicking the load more button', async ({
    loadMore,
  }) => {
    await expect(loadMore.showingResults).toHaveText(
      /Showing 10 of [\d,]+ results/
    );

    await loadMore.button.click();

    await expect(loadMore.showingResults).toHaveText(
      /Showing 20 of [\d,]+ results/
    );
  });
});
