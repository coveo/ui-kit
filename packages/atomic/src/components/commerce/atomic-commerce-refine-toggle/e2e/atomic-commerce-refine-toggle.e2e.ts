import {expect, test} from './fixture';

test.describe('AtomicCommerceRefineToggle', () => {
  test.beforeEach(async ({commerceRefineToggle}) => {
    await commerceRefineToggle.load();
    await commerceRefineToggle.hydrated.waitFor();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });

  test('should open the modal when the button is clicked', async ({
    commerceRefineToggle,
  }) => {
    await commerceRefineToggle.button.click();

    await expect(commerceRefineToggle.filters).toBeVisible();
    await expect(commerceRefineToggle.sort).toBeVisible();
  });
});
