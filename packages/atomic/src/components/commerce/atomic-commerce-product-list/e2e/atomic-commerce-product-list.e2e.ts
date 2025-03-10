import {test, expect} from './fixture';

test.describe('AtomicCommerceProductList', () => {
  test.beforeEach(async ({commerceProductList}) => {
    await commerceProductList.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
