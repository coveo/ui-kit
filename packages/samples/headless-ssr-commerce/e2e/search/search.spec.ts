import {JSDOM} from 'jsdom';
import {test, expect} from './search.fixture';

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
    });

    test('should display suggestions', async ({search}) => {
      const suggestionsContainer = search.suggestionsContainer;
      await expect(suggestionsContainer).toBeVisible();

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
          search.resultSummary.textContent()
        );
      });

      test('should be checked after clicking', async ({facet}) => {
        await expect(facet.firstFacet).toBeChecked();
      });
    });
  });
});
test.describe('ssr', () => {
  const numResults = 9; // Define the numResults variable
  const numResultsMsg = `Rendered page with ${numResults} products`;

  test(`renders page in SSR as expected`, async ({page}) => {
    const responsePromise = page.waitForResponse('**/search');
    await page.goto('/search');

    const response = await responsePromise;
    const responseBody = await response.text();

    const dom = new JSDOM(responseBody);

    expect(
      dom.window.document.querySelector('#hydrated-msg')?.textContent
    ).toBe(numResultsMsg);

    expect(
      dom.window.document.querySelectorAll('[aria-label="Product List"] li')
        .length
    ).toBe(numResults);
    expect(
      (
        dom.window.document.querySelector(
          '#hydrated-indicator'
        ) as HTMLInputElement
      )?.checked
    ).toBe(false);
  });

  test(`renders page in CSR as expected`, async ({page, search, hydrated}) => {
    await page.goto('/search');
    await expect(hydrated.hydratedMessage).toHaveText(numResultsMsg);

    expect(await search.productItems).toHaveLength(numResults);
    expect(await hydrated.hydratedIndicator).toBe(true);
  });

  test('renders product list in SSR and then in CSR', async ({
    page,
    search,
    hydrated,
  }) => {
    const responsePromise = page.waitForResponse('**/search');
    await page.goto('/search');

    const response = await responsePromise;
    const responseBody = await response.text();

    const dom = new JSDOM(responseBody);

    const ssrTimestamp = Date.parse(
      dom.window.document.querySelector('#timestamp')!.textContent || ''
    );

    const hydratedTimestamp = Date.parse(
      (await hydrated.hydratedTimestamp.textContent()) || ''
    );

    expect(ssrTimestamp).not.toBeNaN();
    await expect(hydrated.hydratedMessage).toHaveText(numResultsMsg);
    expect(await search.productItems).toHaveLength(numResults);
    expect(hydratedTimestamp).toBeGreaterThan(ssrTimestamp);
  });

  test('after submitting a query, should change results', async ({
    page,
    search,
    facet,
  }) => {
    await page.goto('/search');
    const initialProducts = await search.productList.textContent();

    await search.searchBox.fill('shoes');
    await search.searchButton.click();

    await facet.facetLoading.waitFor({state: 'visible'});
    await facet.facetLoading.waitFor({state: 'hidden'});

    expect(await search.productList.textContent()).not.toEqual(initialProducts);
  });
});
