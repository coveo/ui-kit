import {expect, test} from './fixture';

test.describe('atomic-commerce-load-more-products', () => {
  test.beforeEach(async ({loadMore}) => {
    await loadMore.load({story: 'default'});
  });

  test('should be accessible', async ({loadMore, makeAxeBuilder}) => {
    await loadMore.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should load more products when clicking the load more button', async ({
    loadMore,
  }) => {
    await expect(loadMore.showingResults).toHaveText(
      /Showing 48 of \d+ products/
    );

    await loadMore.button.click();

    await expect(loadMore.showingResults).toHaveText(
      /Showing 96 of \d+ products/
    );
  });
});
