import {test, expect} from './fixture';

test.describe('AtomicCommerceSearchBoxQuerySuggestions', () => {
  test.beforeEach(async ({commerceSearchBoxQuerySuggestions}) => {
    await commerceSearchBoxQuerySuggestions.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
