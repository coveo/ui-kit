import {expect, test} from './fixture';

test.describe('atomic-results-per-page', () => {
  test.beforeEach(async ({resultsPerPage}) => {
    await resultsPerPage.load();
    await resultsPerPage.hydrated.waitFor();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });
});
