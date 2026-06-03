import {expect, test} from './listing.fixture';

test.describe('default', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/surf-accessories');
  });

  test('should load and display the search box', async ({search}) => {
    await expect(search.searchBox).toBeVisible();
  });

  test.describe('when entering a query', () => {
    test.beforeEach(async ({search}) => {
      const searchBox = search.searchBox;
      await searchBox.fill('shoes');

      const suggestionsContainer = search.suggestionsContainer;
      await expect(suggestionsContainer).toBeVisible();
    });

    test('should display suggestions', async ({search}) => {
      const suggestions = search.suggestions;
      expect(await suggestions.count()).toBeGreaterThan(0);
    });

    test.describe('when clicking a suggestion', () => {
      let suggestionValue: string;
      test.beforeEach(async ({search}) => {
        const suggestions = search.suggestions;
        suggestionValue =
          (await suggestions.first().textContent()) || 'no value found';
        await suggestions.first().click();
      });

      test('should go to search page', async ({page}) => {
        await page.waitForURL('**/search?q=*');

        const currentUrl = page.url();

        expect(currentUrl).toContain(suggestionValue);
      });
    });

    test.describe('when clicking search button', () => {
      test.beforeEach(async ({search}) => {
        search.searchButton.click();
      });

      test('should go to search page', async ({page}) => {
        await page.waitForURL('**/search?q=*');
        const currentUrl = page.url();
        expect(currentUrl).toContain('shoes');
      });
    });
  });

  test.describe('when changing the sort order', () => {
    let originalProductListContents: string;
    test.beforeEach(async ({sort, search}) => {
      originalProductListContents =
        (await search.productList.textContent()) || '';

      await sort.sortSelect.waitFor({state: 'visible'});
      await sort.sortSelect.isEnabled();

      await sort.sortSelect.selectOption({index: 1});
    });

    test('should update the result list', async ({search}) => {
      const productListContents = await search.productList.textContent();

      expect.poll(() =>
        expect(productListContents).not.toEqual(originalProductListContents)
      );
    });
  });
});
