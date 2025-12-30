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
});
