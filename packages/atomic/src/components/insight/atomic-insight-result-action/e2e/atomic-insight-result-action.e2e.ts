import {expect, test} from './fixture';

test.describe('atomic-insight-result-action', () => {
  test.beforeEach(async ({insightResultAction}) => {
    await insightResultAction.load();
    await insightResultAction.hydrated.first().waitFor();
  });

  test('should render all exposed parts', async ({insightResultAction}) => {
    await expect(insightResultAction.actionButton.first()).toBeVisible();
    await expect(insightResultAction.actionIcon.first()).toBeVisible();
    await expect(insightResultAction.actionContainer.first()).toBeVisible();
  });
});
