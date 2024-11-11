import {test, expect} from './search.fixture';

test.describe('Search Page', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/search');
  });

  test('should load and display the search box', async ({search}) => {
    await expect(await search.searchBox()).toBeVisible();
  });

  test.describe('when entering a query', () => {
    let initialProducts: string = '';

    test.beforeEach(async ({search}) => {
      initialProducts =
        (await (await search.getProductList()).textContent()) || '';

      const searchBox = await search.searchBox();
      await searchBox.fill('shoes');
    });

    test('should display suggestions', async ({search}) => {
      const suggestionsContainer = await search.getSuggestionsContainer();
      await expect(suggestionsContainer).toBeVisible();

      const suggestions = await search.getSuggestions();
      expect(await suggestions.count()).toBeGreaterThan(0);
    });

    test.describe('when clicking a suggestion', () => {
      let suggestionValue: string;
      test.beforeEach(async ({facet, search}) => {
        const suggestions = await search.getSuggestions();
        suggestionValue =
          (await suggestions.first().textContent()) || 'no value found';
        await suggestions.first().click();

        await (await facet.getFacetLoading()).waitFor({state: 'visible'});
        await (await facet.getFacetLoading()).waitFor({state: 'hidden'});
      });

      test('should update query', async ({search}) => {
        const searchBox = await search.searchBox();
        await expect(searchBox).toHaveValue(suggestionValue);
      });

      test('should update the results summary', async ({search}) => {
        const resultSummary = await search.getResultSummary();
        await expect(resultSummary).toBeVisible();
      });

      test('should update the result list', async ({search}) => {
        const productListContents = await (
          await search.getProductList()
        ).textContent();

        expect(productListContents).not.toEqual(initialProducts);
      });
    });

    test.describe('when clicking search button', () => {
      test.beforeEach(async ({facet, search}) => {
        (await search.getSearchButton()).click();

        await (await facet.getFacetLoading()).waitFor({state: 'visible'});
        await (await facet.getFacetLoading()).waitFor({state: 'hidden'});
      });

      test('should update product results', async ({search}) => {
        const productListContents = await (
          await search.getProductList()
        ).textContent();

        expect(productListContents).not.toEqual(initialProducts);
      });

      test('should update result summary', async ({search}) => {
        const resultSummary = await search.getResultSummary();
        await expect(resultSummary).toBeVisible();
      });
    });
  });

  test.describe('Facets', () => {
    test('should display the facets', async ({facet}) => {
      const facetsSection = await facet.getFacetsSection();
      await expect(facetsSection).toBeVisible();
    });

    test.describe('when a facet value is selected', () => {
      let initialResultSummary: string | null;
      test.beforeEach(async ({search, facet}) => {
        initialResultSummary = await (
          await search.getResultSummary()
        ).textContent();

        const firstFacet = await facet.getFirstFacet();
        await firstFacet.click();

        const facetLoading = await facet.getFacetLoading();
        await facetLoading.waitFor({state: 'visible'});
        await facetLoading.waitFor({state: 'hidden'});
      });

      test('should update results', async ({search}) => {
        const productItems = await search.getProductItems();
        expect(productItems.length).toBeGreaterThan(0);

        expect(initialResultSummary).not.toEqual(
          (await search.getResultSummary()).textContent()
        );
      });

      test('should be checked after clicking', async ({facet}) => {
        await expect(await facet.getFirstFacet()).toBeChecked();
      });
    });
  });
});
