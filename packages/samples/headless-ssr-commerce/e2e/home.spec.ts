// home.spec.ts
import {test, expect} from '@playwright/test';
import {HomePage} from './home.page';

test.describe('Home Page', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/');
  });

  test('should load and display the search box', async ({page}) => {
    const homePage = new HomePage(page);
    await expect(await homePage.searchBox()).toBeVisible();
  });

  test.describe('when entering a query', () => {
    let initialProducts: string = '';

    test.beforeEach(async ({page}) => {
      const homePage = new HomePage(page);

      initialProducts =
        (await (await homePage.getProductList()).textContent()) || '';

      const searchBox = await homePage.searchBox();
      await searchBox.fill('shoes');
    });

    test('should display suggestions', async ({page}) => {
      const homePage = new HomePage(page);

      const suggestionsContainer = await homePage.getSuggestionsContainer();
      await expect(suggestionsContainer).toBeVisible();

      const suggestions = await homePage.getSuggestions();
      expect(await suggestions.count()).toBeGreaterThan(0);
    });

    test.describe('when clicking a suggestion', () => {
      let suggestionValue: string;
      test.beforeEach(async ({page}) => {
        const homePage = new HomePage(page);

        const suggestions = await homePage.getSuggestions();
        suggestionValue =
          (await suggestions.first().textContent()) || 'no value found';
        await suggestions.first().click();

        await (await homePage.getFacetLoading()).waitFor({state: 'visible'});
        await (await homePage.getFacetLoading()).waitFor({state: 'hidden'});
      });

      test('should update query', async ({page}) => {
        const homePage = new HomePage(page);
        const searchBox = await homePage.searchBox();
        await expect(searchBox).toHaveValue(suggestionValue);
      });

      test('should update the results summary', async ({page}) => {
        const homePage = new HomePage(page);
        const resultSummary = await homePage.getResultSummary();
        await expect(resultSummary).toBeVisible();
      });

      test('should update the result list', async ({page}) => {
        const homePage = new HomePage(page);
        const productListContents = await (
          await homePage.getProductList()
        ).textContent();

        expect(productListContents).not.toEqual(initialProducts);
      });
    });

    test.describe('when clicking search button', () => {
      test.beforeEach(async ({page}) => {
        const homePage = new HomePage(page);

        (await homePage.getSearchButton()).click();

        await (await homePage.getFacetLoading()).waitFor({state: 'visible'});
        await (await homePage.getFacetLoading()).waitFor({state: 'hidden'});
      });

      test('should update product results', async ({page}) => {
        const homePage = new HomePage(page);
        const productListContents = await (
          await homePage.getProductList()
        ).textContent();

        expect(productListContents).not.toEqual(initialProducts);
      });

      test('should update result summary', async ({page}) => {
        const homePage = new HomePage(page);
        const resultSummary = await homePage.getResultSummary();
        await expect(resultSummary).toBeVisible();
      });
    });
  });

  test('should display the facets', async ({page}) => {
    const homePage = new HomePage(page);

    const facetsSection = await homePage.getFacetsSection();
    await expect(facetsSection).toBeVisible();
  });

  test.describe('when a facet value is selected', () => {
    let initialResultSummary: string | null;
    test.beforeEach(async ({page}) => {
      const homePage = new HomePage(page);

      initialResultSummary = await (
        await homePage.getResultSummary()
      ).textContent();

      const firstFacet = await homePage.getFirstFacet();
      await firstFacet.click();

      const facetLoading = await homePage.getFacetLoading();
      await facetLoading.waitFor({state: 'visible'});
      await facetLoading.waitFor({state: 'hidden'});
    });

    test('should update results', async ({page}) => {
      const homePage = new HomePage(page);

      const productItems = await homePage.getProductItems();
      expect(productItems.length).toBeGreaterThan(0);

      expect(initialResultSummary).not.toEqual(
        (await homePage.getResultSummary()).textContent()
      );
    });

    test('should be checked after clicking', async ({page}) => {
      const homePage = new HomePage(page);

      await expect(await homePage.getFirstFacet()).toBeChecked();
    });
  });
});
