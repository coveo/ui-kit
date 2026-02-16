import {expect, test} from './fixture';

test.describe('atomic-commerce-did-you-mean', () => {
  test.beforeEach(async ({commerceDidYouMean}) => {
    await commerceDidYouMean.load();
    await commerceDidYouMean.hydrated.waitFor();
  });

  test('should display the auto correction message', async ({
    commerceDidYouMean,
  }) => {
    await expect(commerceDidYouMean.autoCorrection).toBeVisible();
  });

  test('should display the no results message', async ({
    commerceDidYouMean,
  }) => {
    await expect(commerceDidYouMean.noResults).toBeVisible();
  });
});
