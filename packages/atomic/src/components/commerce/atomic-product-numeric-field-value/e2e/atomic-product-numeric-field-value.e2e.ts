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

  test('should render the value', async ({numericFieldValue}) => {
    const value = numericFieldValue.value.first();
    await expect(value).toBeVisible();
  });

  test('should apply custom formatter', async ({page}) => {
    const element = page.locator('atomic-product-numeric-field-value').first();

    await element.evaluate((el) => {
      const event = new CustomEvent('atomic/numberFormat', {
        detail: (value: number) => `Formatted: ${value}`,
      });
      el.dispatchEvent(event);
    });

    const textContent = await element.textContent();
    expect(textContent).toContain('Formatted:');
  });
});
