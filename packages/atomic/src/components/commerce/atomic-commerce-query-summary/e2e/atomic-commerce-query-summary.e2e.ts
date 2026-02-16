import {expect, test} from './fixture';

test.describe('atomic-commerce-query-summary', () => {
  test.beforeEach(async ({querySummary}) => {
    await querySummary.load();
    await querySummary.hydrated.waitFor();
  });

  test('should display message', async ({querySummary}) => {
    await expect(querySummary.text).toBeVisible();
  });
});
