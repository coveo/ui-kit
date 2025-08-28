import {expect, test} from './fixture';

test.describe('AtomicInsightQuerySummary', () => {
  test.beforeEach(async ({insightQuerySummary}) => {
    await insightQuerySummary.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });

  test('should display message', async ({insightQuerySummary}) => {
    await expect(insightQuerySummary.text).toBeVisible();
  });

  test('screen readers should read out', async ({insightQuerySummary}) => {
    await expect(insightQuerySummary.ariaLive).toBeVisible();
  });
});
