import {expect, test} from './fixture';

test.describe('Atomic Insight Query Summary', () => {
  test.beforeEach(async ({querySummary}) => {
    await querySummary.load({
      story: 'default',
    });
    await querySummary.hydrated();
  });

  test('should load correctly', async ({querySummary}) => {
    await expect(querySummary.querySummary).toBeVisible();
  });

  test('should display default message when no query', async ({
    querySummary,
  }) => {
    await expect(querySummary.querySummary).toHaveText(/Insights related to/);
  });

  test('should be accessible', async ({querySummary, page}) => {
    await expect(querySummary.querySummary).toBeVisible();

    // Check that the component has proper structure
    const snapshot = await page.accessibility.snapshot({
      root: await querySummary.querySummary.elementHandle(),
    });
    expect(snapshot).toBeTruthy();
  });
});
