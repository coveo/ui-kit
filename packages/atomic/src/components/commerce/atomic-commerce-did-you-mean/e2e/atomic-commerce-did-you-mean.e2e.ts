import {test, expect} from './fixture';

test.describe('AtomicCommerceDidYouMean', () => {
  test.beforeEach(async ({commerceDidYouMean}) => {
    await commerceDidYouMean.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
