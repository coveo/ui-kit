import {expect, test} from './fixture';

test.describe('atomic-product-excerpt', async () => {
  test.beforeEach(async ({productExcerpt}) => {
    await productExcerpt.load();
    await productExcerpt.hydrated.first().waitFor();
  });

  test('should render excerpt text and the show more button', async ({
    productExcerpt,
  }) => {
    await productExcerpt.hydrated.first().waitFor();

    await expect(productExcerpt.textContent.first()).toBeVisible();

    const showMoreButton = productExcerpt.showMoreButton.first();
    await expect(showMoreButton).toBeVisible();
  });
});
