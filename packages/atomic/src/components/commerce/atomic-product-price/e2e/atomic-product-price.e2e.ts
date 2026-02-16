import {expect, test} from './fixture';

test.describe('atomic-product-price', () => {
  test.describe('when there is no promotional price', async () => {
    test.beforeEach(async ({productPrice}) => {
      await productPrice.load();
      await productPrice.hydrated.first().waitFor();
    });

    test('should render the price', async ({productPrice}) => {
      await expect(productPrice.blueLagoonPrice).toBeVisible();
    });
  });

  test.describe('when there is a promotional price', async () => {
    test.beforeEach(async ({productPrice}) => {
      await productPrice.load();
      await productPrice.hydrated.first().waitFor();
    });

    test('should render the original price with a line-through', async ({
      productPrice,
    }) => {
      const promoPrice = productPrice.AquaMarinaPrice;
      await expect(promoPrice).toBeVisible();
      await expect(promoPrice).toHaveClass(/.*line-through.*/);
    });

    test('should render the promotional price with a text-error', async ({
      productPrice,
    }) => {
      const promoPrice = productPrice.AquaMarinaPromoPrice;
      await expect(promoPrice).toBeVisible();
      await expect(promoPrice).toHaveClass(/.*text-error.*/);
    });
  });
});
