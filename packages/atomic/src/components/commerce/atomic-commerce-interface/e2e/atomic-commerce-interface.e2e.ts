import {test, expect} from './fixture';

test.describe('AtomicCommerceInterface', () => {
  test.beforeEach(async ({commerceInterface}) => {
    await commerceInterface.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
