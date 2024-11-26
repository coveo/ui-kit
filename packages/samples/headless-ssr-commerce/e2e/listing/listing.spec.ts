import {JSDOM} from 'jsdom';
import {test, expect} from './listing.fixture';

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
        await page.waitForURL('**/search#q=*');

        const currentUrl = page.url();

        expect(currentUrl).toContain(suggestionValue);
      });
    });

    test.describe('when clicking search button', () => {
      test.beforeEach(async ({search}) => {
        search.searchButton.click();
      });

      test('should go to search page', async ({page}) => {
        await page.waitForURL('**/search#q=*');
        const currentUrl = page.url();
        expect(currentUrl).toContain('shoes');
      });
    });
  });

  test.describe('when changing the sort order', () => {
    let originalProductListContents: string;
    test.beforeEach(async ({sort, search, facet}) => {
      originalProductListContents =
        (await search.productList.textContent()) || '';

      await sort.sortSelect.waitFor({state: 'visible'});
      await sort.sortSelect.isEnabled();

      await sort.sortSelect.selectOption({index: 1});
      await facet.facetLoading.waitFor({state: 'visible'});
      await facet.facetLoading.waitFor({state: 'hidden'});
    });

    test('should update the result list', async ({search}) => {
      const productListContents = await search.productList.textContent();

      expect(productListContents).not.toEqual(originalProductListContents);
    });
  });
});

test.describe('ssr', () => {
  const numResults = 9; // Define the numResults variable
  const numResultsMsg = `Rendered page with ${numResults} products`;

  test(`renders page in SSR as expected`, async ({page}) => {
    const responsePromise = page.waitForResponse('**/surf-accessories');
    await page.goto('/surf-accessories');

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
      (dom.window.document.querySelector('#sorts-select') as HTMLSelectElement)
        .selectedOptions[0]?.textContent
    ).toBe('Relevance');

    expect(
      (
        dom.window.document.querySelector(
          '#hydrated-indicator'
        ) as HTMLInputElement
      )?.checked
    ).toBe(false);
  });

  test(`renders page in CSR as expected`, async ({
    page,
    search,
    sort,
    hydrated,
  }) => {
    await page.goto('/surf-accessories');

    await expect(hydrated.hydratedMessage).toHaveText(numResultsMsg);
    expect(await search.productItems).toHaveLength(numResults);
    expect(await sort.selectedOption.textContent()).toBe('Relevance');
    expect(await hydrated.hydratedIndicator).toBe(true);
  });

  test('renders product list in SSR and then in CSR', async ({
    page,
    search,
    hydrated,
  }) => {
    const responsePromise = page.waitForResponse('**/surf-accessories');
    await page.goto('/surf-accessories');

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
});
