import {expect, test} from './fixture';

test.describe('atomic-load-more-results', () => {
  test.beforeEach(async ({loadMore}) => {
    await loadMore.load({story: 'default'});
  });

  test('should display a load more button when there are more results', async ({
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
