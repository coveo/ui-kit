import {expect, test} from './fixture';

test.describe('atomic-product-description', async () => {
  test.beforeEach(async ({productDescription}) => {
    await productDescription.load();
    await productDescription.hydrated.first().waitFor();
  });

  test('should render description text and the show more button', async ({
    productDescription,
  }) => {
    await productDescription.hydrated.first().waitFor();

    await expect(productDescription.textContent.first()).toBeVisible();

    const showMoreButton = productDescription.showMoreButton.first();
    await expect(showMoreButton).toBeVisible();
  });
});
