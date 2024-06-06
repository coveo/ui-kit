import {test, expect} from './fixture';
import {AtomicCommerceLoadMoreProductsLocators} from './page-object';

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

test('should a progress value between 1 and 100', async ({loadMore}) => {
  await expect(loadMore.progressValue).toHaveCSS('width', /^.+$/);
});

test.describe('after clicking the load more button', () => {
  const getTotal = async (loadMore: AtomicCommerceLoadMoreProductsLocators) => {
    const recap = await loadMore.summary().textContent();
    const totalMatch = recap?.match(/\bshowing ([0-9]+) of/i);
    return totalMatch ? parseInt(totalMatch[1]) : 0;
  };

  test('should load more products', async ({loadMore, products, page}) => {
    await products.hydrated.waitFor();
    const initialProductCount = await products.results.count();
    await loadMore.button.click();
    await page.waitForTimeout(1000);

    const finalProductCount = await products.results.count();
    const summaryTotal = await getTotal(loadMore);

    expect(finalProductCount).toBeGreaterThan(initialProductCount);
    expect(summaryTotal).toEqual(finalProductCount);
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
