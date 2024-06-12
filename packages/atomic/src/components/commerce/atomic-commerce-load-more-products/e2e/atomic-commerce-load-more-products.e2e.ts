import {Page, Response} from '@playwright/test';
import {test, expect} from './fixture';

test.beforeEach(async ({page}) => {
  await page.goto(
    'http://localhost:4400/iframe.html?id=atomic-commerce-load-more-products--in-page&viewMode=story'
  );
});

test('should be A11y compliant', async ({loadMore, makeAxeBuilder}) => {
  await loadMore.hydrated.waitFor();
  const accessibilityResults = await makeAxeBuilder().analyze();
  expect(accessibilityResults.violations).toEqual([]);
});

test('should display a recap of the amount of results', async ({loadMore}) => {
  await await expect(loadMore.summary()).toBeVisible();
});

test('should display a load more button', async ({loadMore}) => {
  await loadMore.button.waitFor({state: 'visible'});
  await expect(loadMore.button).toBeVisible();
});

test('should display a progress bar', async ({loadMore}) => {
  await expect(loadMore.progressBar).toBeVisible();
});

test('should display a progress value between 1 and 100', async ({
  loadMore,
}) => {
  await expect(loadMore.progressValue).toHaveCSS('width', /^.+$/);
});

test.describe('after clicking the load more button', () => {
  // TODO: KIT-3306 - Create a getApiResponseBody helper to avoid repeating the same code in multiple tests
  const waitForSearchResponse = async (page: Page) => {
    return page.waitForResponse(
      (response) =>
        // TODO: KIT-3306 - Create RouteAlias to avoid hard coding url directly in the test
        response.url().includes('barcasportsmcy01fvu/commerce/v2/search') &&
        response.status() === 200
    );
  };

  const getPerPageFromResponse = async (response: Response) => {
    const {
      pagination: {perPage},
    } = await response.json();
    return perPage;
  };

  test('should load more products', async ({loadMore, products, page}) => {
    const initialResponse = await waitForSearchResponse(page);
    await products.hydrated.waitFor();
    await loadMore.button.click();
    const finalResponse = await waitForSearchResponse(page);

    const total =
      (await getPerPageFromResponse(initialResponse)) +
      (await getPerPageFromResponse(finalResponse));

    await expect(products.results).toHaveCount(total);
    await expect(loadMore.summary({index: total})).toBeVisible();
  });
});

test.describe('when theres no results', () => {
  test('should be hidden', async ({searchBox, loadMore}) => {
    await loadMore.button.waitFor({state: 'visible'});
    await searchBox.searchInput
      // eslint-disable-next-line @cspell/spellchecker
      .fill('@urihash=bzo5fpM1vf8Xñds1');
    await searchBox.submitButton.click();
    await expect(loadMore.button).not.toBeVisible();
  });
});
