import {expect, test} from './search.fixture';

test.describe('default', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/search');
  });

  test('should load and display the search box', async ({search}) => {
    await expect(search.searchBox).toBeVisible();
  });

  test.describe('when entering a query', () => {
    let initialProducts: string = '';

    test.beforeEach(async ({search}) => {
      initialProducts = (await search.productList.textContent()) || '';

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
      test.beforeEach(async ({facet, search}) => {
        const suggestions = search.suggestions;
        suggestionValue =
          (await suggestions.first().textContent()) || 'no value found';
        await suggestions.first().click();

        await facet.facetLoading.waitFor({state: 'visible'});
        await facet.facetLoading.waitFor({state: 'hidden'});
      });

      test('should update query', async ({search}) => {
        const searchBox = search.searchBox;
        await expect(searchBox).toHaveValue(suggestionValue);
      });

      test('should update the results summary', async ({search}) => {
        const resultSummary = search.resultSummary;
        await expect(resultSummary).toBeVisible();
      });

      test('should update the result list', async ({search}) => {
        const productListContents = await search.productList.textContent();

        expect(productListContents).not.toEqual(initialProducts);
      });
    });

    test.describe('when clicking search button', () => {
      test.beforeEach(async ({facet, search}) => {
        search.searchButton.click();

        await facet.facetLoading.waitFor({state: 'visible'});
        await facet.facetLoading.waitFor({state: 'hidden'});
      });

      test('should update product results', async ({search}) => {
        const productListContents = await search.productList.textContent();

        expect(productListContents).not.toEqual(initialProducts);
      });

      test('should update result summary', async ({search}) => {
        const resultSummary = search.resultSummary;
        await expect(resultSummary).toBeVisible();
      });
    });
  });

  test.describe('Facets', () => {
    test('should display the facets', async ({facet}) => {
      const facetsSection = facet.facetsSection;
      await expect(facetsSection).toBeVisible();
    });

    test.describe('when a facet value is selected', () => {
      let initialResultSummary: string | null;
      test.beforeEach(async ({search, facet}) => {
        initialResultSummary = await search.resultSummary.textContent();

        const firstFacet = facet.firstFacet;
        await firstFacet.click();

        const facetLoading = facet.facetLoading;
        await facetLoading.waitFor({state: 'visible'});
        await facetLoading.waitFor({state: 'hidden'});
      });

      test('should update results', async ({search}) => {
        const productItems = await search.productItems;
        expect(productItems.length).toBeGreaterThan(0);

        expect(initialResultSummary).not.toEqual(
          await search.resultSummary.textContent()
        );
      });

      test('should be checked after clicking', async ({facet}) => {
        await expect(facet.firstFacet).toBeChecked();
      });
    });
  });
});
