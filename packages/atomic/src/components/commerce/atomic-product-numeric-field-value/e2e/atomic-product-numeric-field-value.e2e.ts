import {expect, test} from './fixture';

test.describe('atomic-product-numeric-field-value', () => {
  test.beforeEach(async ({numericFieldValue}) => {
    await numericFieldValue.load();
    await numericFieldValue.hydrated.first().waitFor({state: 'visible'});
  });

  test('should be a11y compliant', async ({
    numericFieldValue,
    makeAxeBuilder,
  }) => {
    await numericFieldValue.hydrated.first().waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });
});
