import {expect, test} from './fixture';

test.describe('atomic-product-children', () => {
  test.beforeEach(async ({productChildren}) => {
    await productChildren.load();
    await productChildren.hydrated.waitFor();
  });

  test('should render a label', async ({productChildren}) => {
    await expect(productChildren.availableInLabel).toBeVisible();
  });

  test('should render child products', async ({productChildren}) => {
    const count = await productChildren.childProducts.count();
    expect(count).toBeGreaterThan(1);
  });
});
