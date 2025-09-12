import {expect, test} from './fixture';

test.describe('AtomicQuerySummary', () => {
  test.beforeEach(async ({querySummary}) => {
    await querySummary.load();
    await querySummary.hydrated.waitFor();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should display message', async ({querySummary}) => {
    await expect(querySummary.text).toBeVisible();
  });

  test('screen readers should read out', async ({querySummary}) => {
    await expect(querySummary.ariaLive).toBeVisible();
  });

  test('should have duration element in DOM', async ({querySummary}) => {
    const durationCount = await querySummary.duration.count();
    expect(durationCount).toBeGreaterThanOrEqual(0);
  });
});
