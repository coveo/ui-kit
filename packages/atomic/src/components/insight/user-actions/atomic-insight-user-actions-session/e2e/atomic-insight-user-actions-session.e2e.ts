import {expect, test} from './fixture';

test.describe('user actions session', () => {
  test.describe('with regular session', () => {
    test.beforeEach(async ({userActionsSession}) => {
      await userActionsSession.load({
        story: 'default',
      });
    });

    test('should display the session start date', async ({
      userActionsSession,
    }) => {
      await expect(userActionsSession.sessionStartDate).toBeVisible();
    });

    test('should display user actions', async ({userActionsSession}) => {
      const actions = await userActionsSession.userActionsList.count();
      expect(actions).toBeGreaterThan(0);
    });

    test('should not display the case creation icon', async ({
      userActionsSession,
    }) => {
      await expect(userActionsSession.sessionStartIcon).not.toBeVisible();
    });

    test('should not display show more actions button', async ({
      userActionsSession,
    }) => {
      await expect(userActionsSession.showMoreActionsButton).not.toBeVisible();
    });
  });

  test.describe('with case creation session', () => {
    test.beforeEach(async ({userActionsSession}) => {
      await userActionsSession.load({
        story: 'case-creation-session',
      });
    });

    test('should display the case creation icon', async ({
      userActionsSession,
    }) => {
      await expect(userActionsSession.sessionStartIcon).toBeVisible();
    });

    test('should display show more actions button', async ({
      userActionsSession,
    }) => {
      await expect(userActionsSession.showMoreActionsButton).toBeVisible();
    });

    test.describe('when clicking show more actions button', () => {
      test('should reveal actions before case creation', async ({
        userActionsSession,
      }) => {
        await expect(userActionsSession.moreActionsSection).not.toBeVisible();

        await userActionsSession.showMoreActionsButton.click();

        await expect(userActionsSession.moreActionsSection).toBeVisible();
      });
    });
  });

  test.describe('accessibility', () => {
    test.beforeEach(async ({userActionsSession}) => {
      await userActionsSession.load({
        story: 'case-creation-session',
      });
    });

    test('should have accessible button', async ({userActionsSession}) => {
      const button = userActionsSession.showMoreActionsButton;
      await expect(button).toHaveAttribute('aria-label');
    });
  });
});
