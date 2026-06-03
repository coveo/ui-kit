import {expect, test} from './fixture';

test.describe('atomic-insight-user-actions-timeline', () => {
  test('should render with the active session', async ({
    userActionsTimeline,
  }) => {
    await userActionsTimeline.load();
    await expect(userActionsTimeline.activeSession).toBeVisible();
  });
});
