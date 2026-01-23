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

  test.describe('when toggling the following sessions', () => {
    test('should properly show and hide the following sessions', async ({
      userActionsTimeline,
    }) => {
      await userActionsTimeline.showFollowingSessionsbutton.click();
      await expect(
        userActionsTimeline.hideFollowingSessionsbutton
      ).toBeVisible();
      await expect(userActionsTimeline.followingSession).toHaveCount(2);

      await userActionsTimeline.hideFollowingSessionsbutton.click();
      await expect(
        userActionsTimeline.showFollowingSessionsbutton
      ).toBeVisible();
      await expect(userActionsTimeline.followingSession).not.toBeVisible();
    });
  });

  test.describe('when toggling the preceding sessions', () => {
    test('should properly show and hide the preceding sessions', async ({
      userActionsTimeline,
    }) => {
      await userActionsTimeline.showPrecedingSessionsbutton.click();
      await expect(
        userActionsTimeline.hidePrecedingSessionsbutton
      ).toBeVisible();
      await expect(userActionsTimeline.precedingSession).toHaveCount(2);

      await userActionsTimeline.hidePrecedingSessionsbutton.click();
      await expect(
        userActionsTimeline.showPrecedingSessionsbutton
      ).toBeVisible();
      await expect(userActionsTimeline.precedingSession).not.toBeVisible();
    });
  });

  test.describe('error and empty states', () => {
    test('should display the user actions error screen', async ({
      userActionsTimeline,
      page,
    }) => {
      await userActionsTimeline.mockUserActionsError(page);
      await expect(userActionsTimeline.userActionsError).toBeVisible();
    });

    test('should display empty timeline', async ({
      userActionsTimeline,
      page,
    }) => {
      await userActionsTimeline.mockUserActions(page, []);
      await expect(userActionsTimeline.userActionsError).toBeVisible();
    });
  });
});
