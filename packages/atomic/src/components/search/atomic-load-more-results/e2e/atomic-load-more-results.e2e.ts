import {expect, test} from './fixture';

test.describe('atomic-load-more-results', () => {
  test.beforeEach(async ({loadMore}) => {
    await loadMore.load({story: 'default'});
  });

  test('should display a load more button when there are more results', async ({
    loadMore,
  }) => {
    await expect(loadMore.showingResults).toHaveText(
      /Showing 40 of [\d,]+ results/
    );

    await loadMore.button.click();

    await expect(loadMore.showingResults).toHaveText(
      /Showing 80 of [\d,]+ results/
    );
  });
});
