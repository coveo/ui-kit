import {expect, test} from './fixture';

test.describe('atomic-insight-result-attach-to-case-action', () => {
  test.beforeEach(async ({insightResultAttachToCaseAction}) => {
    await insightResultAttachToCaseAction.load({story: 'default'});
    await insightResultAttachToCaseAction.hydrated.first().waitFor();
  });

  test('should render the action button', async ({
    insightResultAttachToCaseAction,
  }) => {
    await expect(
      insightResultAttachToCaseAction.actionButton.first()
    ).toBeVisible();
  });

  test('should have accessible label', async ({
    insightResultAttachToCaseAction,
  }) => {
    await expect(
      insightResultAttachToCaseAction.actionButton.first()
    ).toHaveAccessibleName(/attach to case|detach from case/i);
  });
});
