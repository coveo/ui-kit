import {expect, test} from './fixture';

test.describe('atomic-product-numeric-field-value', () => {
  test.beforeEach(async ({numericFieldValue}) => {
    await numericFieldValue.load();
    // Wait for the component to be present instead of relying on hydrated class
    await numericFieldValue.page
      .locator('atomic-product-numeric-field-value')
      .first()
      .waitFor({state: 'attached'});
  });

  test('should be a11y compliant', async ({
    numericFieldValue,
    makeAxeBuilder,
  }) => {
    await numericFieldValue.page
      .locator('atomic-product-numeric-field-value')
      .first()
      .waitFor({state: 'attached'});
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });
});
