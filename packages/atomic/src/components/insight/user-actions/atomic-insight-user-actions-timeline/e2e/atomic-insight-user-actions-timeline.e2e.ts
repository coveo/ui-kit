import {expect, test} from './fixture';

test.describe('atomic-insight-user-actions-timeline', () => {
  test.beforeEach(async ({userActionsTimeline}) => {
    await userActionsTimeline.load();
  });

  test('should render with the active session', async ({
    userActionsTimeline,
  }) => {
    await expect(userActionsTimeline.activeSession).toBeVisible();
  });

  test('should render toggle buttons for following and preceding sessions', async ({
    userActionsTimeline,
  }) => {
    await expect(userActionsTimeline.showFollowingSessionsbutton).toBeVisible();
    await expect(userActionsTimeline.showPrecedingSessionsbutton).toBeVisible();
  });
});
