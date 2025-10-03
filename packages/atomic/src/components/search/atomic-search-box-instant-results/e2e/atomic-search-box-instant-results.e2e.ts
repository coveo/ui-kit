import {expect, test} from './fixture';

test.describe('atomic-search-box-instant-results', () => {
  test.beforeEach(async ({searchBoxInstantResults}) => {
    await searchBoxInstantResults.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
