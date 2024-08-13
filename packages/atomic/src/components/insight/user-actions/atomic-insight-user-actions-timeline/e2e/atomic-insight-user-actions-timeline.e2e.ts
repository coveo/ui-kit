import {test, expect} from './fixture';

test.describe('default', () => {
  test.beforeEach(async ({userActionsTimeline}) => {
    await userActionsTimeline.load({args: {suggestionTimeout: 5000}});
  });

  test('should display the active session', async ({userActionsTimeline}) => {
    await expect(userActionsTimeline.activeSession).toBeVisible();
  });

  test('should display the show following sessions button', async ({
    userActionsTimeline,
  }) => {
    await expect(userActionsTimeline.showFollowingSessionsbutton).toBeVisible();
  });

  test('should display the show preceding sessions button', async ({
    userActionsTimeline,
  }) => {
    await expect(userActionsTimeline.showPrecedingSessionsbutton).toBeVisible();
  });

  test('should not display the preceding sessions automatically', async ({
    userActionsTimeline,
  }) => {
    await expect(userActionsTimeline.precedingSession).not.toBeVisible();
  });

  test('should not display the following sessions automatically', async ({
    userActionsTimeline,
  }) => {
    await expect(userActionsTimeline.followingSession).not.toBeVisible();
  });

  test.describe('when toggling the following sessions', () => {
    test('should properly show and hide the following sessions', async ({
      userActionsTimeline,
    }) => {
      const expectedFollowingSessionsCount = 2;

      await userActionsTimeline.showFollowingSessionsbutton.click();
      await userActionsTimeline.hideFollowingSessionsbutton.waitFor({
        state: 'visible',
      });

      await expect(userActionsTimeline.followingSession).toHaveCount(
        expectedFollowingSessionsCount
      );

      await userActionsTimeline.hideFollowingSessionsbutton.click();
      await userActionsTimeline.showFollowingSessionsbutton.waitFor({
        state: 'visible',
      });

      await expect(userActionsTimeline.followingSession).not.toBeVisible();
    });
  });

  test.describe('when toggling the preceding sessions', () => {
    test('should properly show and hide the preceding sessions', async ({
      userActionsTimeline,
    }) => {
      const expectedPrecedingSessionsCount = 2;

      await userActionsTimeline.showPrecedingSessionsbutton.click();
      await userActionsTimeline.hidePrecedingSessionsbutton.waitFor({
        state: 'visible',
      });

      await expect(userActionsTimeline.precedingSession).toHaveCount(
        expectedPrecedingSessionsCount
      );

      await userActionsTimeline.hidePrecedingSessionsbutton.click();
      await userActionsTimeline.showPrecedingSessionsbutton.waitFor({
        state: 'visible',
      });

      await expect(userActionsTimeline.precedingSession).not.toBeVisible();
    });
  });
});
