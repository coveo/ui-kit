import {expect, test} from './fixture';

test.describe('atomic-product-template', async () => {
  test('should display atomic product components when a child of a product list', async ({
    productTemplate,
  }) => {
    await productTemplate.load({story: 'in-a-product-list'});

    await expect(productTemplate.product).toBeVisible();
  });

  test('should display atomic-product components when a child of a recommendation list', async ({
    productTemplate,
  }) => {
    await productTemplate.load({story: 'in-a-recommendation-list'});

    await expect(productTemplate.product).toBeVisible();
  });

  test('should display atomic-product components when a child of a search box instant products', async ({
    productTemplate,
  }) => {
    await productTemplate.load({story: 'in-a-search-box-instant-products'});

    await expect(productTemplate.product).toBeVisible();
  });
});
