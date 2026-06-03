import {expect, test} from './fixture';

test.describe('atomic-insight-result-quickview-action', () => {
  test.beforeEach(async ({insightResultQuickviewAction}) => {
    await insightResultQuickviewAction.load();
    await insightResultQuickviewAction.hydrated.first().waitFor();
  });

  test('should render quickview button', async ({
    insightResultQuickviewAction,
  }) => {
    await expect(insightResultQuickviewAction.resultButton).toBeVisible();
  });
});
