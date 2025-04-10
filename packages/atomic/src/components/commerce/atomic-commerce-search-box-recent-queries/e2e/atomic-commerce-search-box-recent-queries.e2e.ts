import {test, expect} from './fixture';

test.describe('AtomicCommerceSearchBoxRecentQueries', () => {
  test.beforeEach(async ({commerceSearchBoxRecentQueries}) => {
    await commerceSearchBoxRecentQueries.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
