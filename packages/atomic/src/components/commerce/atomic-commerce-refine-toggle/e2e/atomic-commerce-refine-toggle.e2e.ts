import {expect, test} from './fixture';

test.describe('atomic-commerce-refine-toggle', () => {
  test.beforeEach(async ({commerceRefineToggle}) => {
    await commerceRefineToggle.load();
    await commerceRefineToggle.hydrated.waitFor();
  });

  test('should open the modal when the button is clicked', async ({
    commerceRefineToggle,
  }) => {
    await commerceRefineToggle.button.click();

    await expect(commerceRefineToggle.filters).toBeVisible();
    await expect(commerceRefineToggle.sort).toBeVisible();
  });
});
