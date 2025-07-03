import {test, expect} from './fixture';

test.describe('atomic-commerce-load-more-products', () => {
  test.beforeEach(async ({loadMore}) => {
    await loadMore.load({story: 'default'});
  });

  test('should be A11y compliant', async ({loadMore, makeAxeBuilder}) => {
    await loadMore.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should load more products when clicking the load more button', async ({
    loadMore,
    products,
  }) => {
    await expect(products.products).toHaveCount(48);

    await loadMore.button.click();

    const allProducts = await products.products.all();
    await Promise.all(
      allProducts.map(async (product) => product.waitFor({state: 'attached'}))
    );
    await expect(products.products).toHaveCount(96);
  });
});
