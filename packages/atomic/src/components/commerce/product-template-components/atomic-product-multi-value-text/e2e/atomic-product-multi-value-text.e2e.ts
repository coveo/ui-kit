import {test, expect} from './fixture';

test.describe('default', () => {
  test.beforeEach(async ({productMultiValueText}) => {
    await productMultiValueText.load();
  });

  test('should be accessible', async ({
    productMultiValueText,
    makeAxeBuilder,
  }) => {
    await expect(productMultiValueText.hydrated.first()).toBeVisible();

    expect((await makeAxeBuilder().analyze()).violations.length).toBe(0);
  });
});
