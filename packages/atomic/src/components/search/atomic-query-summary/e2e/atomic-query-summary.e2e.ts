import {expect, test} from './fixture';

test.describe('AtomicQuerySummary', () => {
  test.beforeEach(async ({querySummary}) => {
    await querySummary.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
