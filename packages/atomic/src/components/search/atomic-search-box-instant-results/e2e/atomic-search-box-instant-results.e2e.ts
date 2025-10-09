import {expect, test} from './fixture';

test.describe('atomic-search-box-instant-results', () => {
  test('should be accessible', async ({
    searchBoxInstantResults,
    makeAxeBuilder,
  }) => {
    await searchBoxInstantResults.load();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });
});
