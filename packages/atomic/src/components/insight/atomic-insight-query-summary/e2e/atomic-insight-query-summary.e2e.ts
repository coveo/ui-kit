import {expect, test} from './fixture';

test.describe('AtomicInsightQuerySummary', () => {
  test.beforeEach(async ({insightQuerySummary}) => {
    await insightQuerySummary.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
