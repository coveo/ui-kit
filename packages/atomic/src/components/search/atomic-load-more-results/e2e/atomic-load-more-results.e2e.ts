import {expect, test} from './fixture';

test.describe('atomic-load-more-results', () => {
  test.beforeEach(async ({loadMore}) => {
    await loadMore.load({story: 'in-page'});
    await loadMore.hydrated.waitFor();
  });

  test('should display a load more button when there are more results', async ({
    loadMore,
  }) => {
    await expect(loadMore.button).toBeVisible();
  });

  test('should display a summary of results', async ({loadMore}) => {
    await expect(loadMore.summary).toBeVisible();
  });

  test.describe('when performing new search after load more', () => {
    test('should maintain scroll position at top (KIT-4268)', async ({
      loadMore,
      searchBox,
      page,
    }) => {
      await loadMore.button.click();

      await page.evaluate(() => window.scroll(0, 0));

      await searchBox.searchInput.clear();
      await searchBox.searchInput.fill('different search term');
      const currentScrollY = await page.evaluate(() => window.scrollY);
      await searchBox.submitButton.click();

      await expect(page.evaluate(() => window.scrollY)).resolves.toBe(
        currentScrollY
      );
    });
  });

  test.describe('when clicking load more button', () => {
    test('should load more results', async ({loadMore, page}) => {
      const initialResultCount = await page.locator('atomic-result').count();
      expect(initialResultCount).toBeGreaterThan(0);

      await loadMore.button.click();

      await expect(page.locator('atomic-result')).toHaveCount(
        initialResultCount * 2
      );
    });

    test('should update the results summary', async ({loadMore}) => {
      await loadMore.button.click();
      await expect(loadMore.summary).toBeVisible();
    });
  });
});
