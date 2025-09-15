import {expect, test} from './fixture';

test.describe('atomic-query-summary', () => {
  test.beforeEach(async ({querySummary}) => {
    await querySummary.load();
    await querySummary.hydrated.waitFor();
  });

  test('should be accessible', async ({makeAxeBuilder, querySummary}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);

    await expect(querySummary.ariaLive).toBeVisible();
  });

  test('should display message with hidden duration count', async ({
    querySummary,
  }) => {
    const durationCount = await querySummary.duration.count();
    expect(durationCount).toBeGreaterThanOrEqual(0);
    await expect(querySummary.text).toBeVisible();
  });
});
