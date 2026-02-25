import {expect, test} from './fixture';

test.describe('atomic-insight-result-action', () => {
  test.beforeEach(async ({insightResultAction}) => {
    await insightResultAction.load();
    await insightResultAction.hydrated.first().waitFor();
  });

  test('should render the action button', async ({insightResultAction}) => {
    await expect(insightResultAction.actionButton.first()).toBeVisible();
  });

  test('should render the action icon', async ({insightResultAction}) => {
    await expect(insightResultAction.actionIcon.first()).toBeVisible();
  });

  test('should render the action container', async ({insightResultAction}) => {
    await expect(insightResultAction.actionContainer.first()).toBeVisible();
  });
});
