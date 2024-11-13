import {JSDOM} from 'jsdom';
import {test, expect} from './search.fixture';

const numResults = 9; // Define the numResults variable
const numResultsMsg = `Rendered page with ${numResults} results`;

test.describe('headless commerce ssr search', () => {
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

  test(`renders page in CSR as expected`, async ({page, search}) => {
    await page.goto('/search');
    await expect(search.hydratedMessage).toHaveText(numResultsMsg);

    expect(await search.productItems).toHaveLength(numResults);
    expect(await search.hydratedIndicator).toBe(true);
  });

  test('renders product list in SSR and then in CSR', async ({
    page,
    search,
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
      (await search.hydratedTimestamp.textContent()) || ''
    );

    expect(ssrTimestamp).not.toBeNaN();
    await expect(search.hydratedMessage).toHaveText(numResultsMsg);
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
