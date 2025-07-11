import {expect, test} from './fixture';

test.describe('AtomicProductChildren', () => {
  test.beforeEach(async ({productChildren}) => {
    await productChildren.load();
    await productChildren.hydrated.waitFor();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should render a label', async ({productChildren}) => {
    await expect(productChildren.label).toHaveText('Available in:');
  });

  test('should render child products', async ({productChildren}) => {
    const count = await productChildren.childProducts.count();
    expect(count).toBeGreaterThan(2);
  });
});
