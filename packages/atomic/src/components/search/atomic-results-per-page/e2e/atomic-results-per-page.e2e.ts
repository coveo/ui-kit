import {expect, test} from './fixture';

test.describe('AtomicResultsPerPage', () => {
  test.beforeEach(async ({resultsPerPage}) => {
    await resultsPerPage.load();
    await resultsPerPage.hydrated.waitFor();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
