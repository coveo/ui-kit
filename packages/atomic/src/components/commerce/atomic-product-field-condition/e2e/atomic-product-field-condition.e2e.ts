import {expect, test} from './fixture';

test.describe('atomic-product-field-condition', () => {
  test.beforeEach(async ({productFieldCondition}) => {
    await productFieldCondition.load();
    await productFieldCondition.hydrated.first().waitFor();
  });

  test('should render its content when if-defined condition is met', async ({
    productFieldCondition,
  }) => {
    await productFieldCondition.load({args: {'if-defined': 'ec_name'}});
    await productFieldCondition.hydrated.first().waitFor();

    const visibleCount = await productFieldCondition.visibleConditions.count();
    expect(visibleCount).toBeGreaterThan(0);
  });

  test('should render its content when must-match condition is met', async ({
    productFieldCondition,
  }) => {
    await productFieldCondition.load({
      args: {'must-match-ec_category': 'Clothing'},
    });
    await productFieldCondition.hydrated.first().waitFor();

    const visibleCount = await productFieldCondition.visibleConditions.count();
    expect(visibleCount).toBeGreaterThan(0);
  });

  test('should not render its content when if-not-defined condition is not met', async ({
    productFieldCondition,
    page,
  }) => {
    await productFieldCondition.load({args: {'if-not-defined': 'ec_name'}});

    const elements = await page.locator('atomic-product-field-condition').all();
    expect(elements.length).toBe(0);
  });
});
