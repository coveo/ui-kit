import {expect, test} from './fixture';

test.describe('atomic-product-multi-value-text', () => {
  test.beforeEach(async ({productMultiValueText}) => {
    await productMultiValueText.load();
    await productMultiValueText.hydrated.waitFor();
  });

  test('should render 3 values and 3 separators', async ({
    productMultiValueText,
  }) => {
    await expect(productMultiValueText.values).toHaveCount(3);
    await expect(productMultiValueText.separators).toHaveCount(3);
  });

  test('should render an indicator that 3 more values are available', async ({
    productMultiValueText,
  }) => {
    await expect(productMultiValueText.moreValuesIndicator(3)).toBeVisible();
  });
});
