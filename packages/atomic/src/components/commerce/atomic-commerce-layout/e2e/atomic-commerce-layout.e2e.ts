import {test, expect} from './fixture';

test.describe('AtomicCommerceLayout', () => {
  test.beforeEach(async ({commerceLayout}) => {
    await commerceLayout.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
