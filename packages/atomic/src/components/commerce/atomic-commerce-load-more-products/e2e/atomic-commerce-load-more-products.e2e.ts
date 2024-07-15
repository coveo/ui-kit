import {test, expect} from './fixture';

test.describe('load more products with products returned by the API', () => {
  test.beforeEach(async ({loadMore}) => {
    await loadMore.load({story: 'in-page'});
  });

  test('should be A11y compliant', async ({loadMore, makeAxeBuilder}) => {
    await loadMore.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should display a recap of the amount of products', async ({
    loadMore,
  }) => {
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
    test('should load more products', async ({loadMore, products}) => {
      await expect(products.products).toHaveCount(48);
      await loadMore.button.click();
      const allProducts = await products.products.all();
      await Promise.all(
        allProducts.map(async (product) => product.waitFor({state: 'attached'}))
      );
      await expect(products.products).toHaveCount(96);
    });
  });
});

test.describe('load more products when there are no products', () => {
  test('should be hidden', async ({loadMore, page}) => {
    await loadMore.noProducts();
    await loadMore.load({story: 'in-page'});
    await page.waitForLoadState('networkidle');
    await expect(loadMore.button).not.toBeVisible();
  });
});
