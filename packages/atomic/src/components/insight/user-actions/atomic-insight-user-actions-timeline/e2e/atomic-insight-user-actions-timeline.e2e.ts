import {test, expect} from './fixture';

const followingSessionActions = [
  {
    name: 'CUSTOM',
    value:
      '{"event_type":"example","event_value":"exampleCustomAction","origin_level_1":"default"}',
    time: '1823680000000',
  },
];

const caseCreationSessionActions = [
  {
    name: 'CUSTOM',
    value:
      '{"event_type":"errors","event_value":"play","origin_level_1":"default","origin_level_2":"default"}',
    time: '1723680000001',
  },
  {
    name: 'CUSTOM',
    value:
      '{"event_type":"errors","event_value":"play","origin_level_1":"default","origin_level_2":"default"}',
    time: '1723680000002',
  },
  {
    name: 'CUSTOM',
    value:
      '{"event_type":"errors","event_value":"play","origin_level_1":"default","origin_level_2":"default"}',
    time: '1723679999999',
  },
];

const precedingSessionActions = [
  {
    name: 'CUSTOM',
    value:
      '{"event_type":"example","event_value":"exampleCustomAction","origin_level_1":"default"}',
    time: '1623680000000',
  },
];

const exampleUserActions = [
  ...followingSessionActions,
  ...caseCreationSessionActions,
  ...precedingSessionActions,
];

const exampleUserId = 'exampleUserId';
const exampleTicketCreationDate = encodeURIComponent('2024-08-15');

test.describe('default', () => {
  test.describe('when user actions data is found', () => {
    test.beforeEach(async ({userActionsTimeline, page}) => {
      await userActionsTimeline.load({
        args: {
          userId: exampleUserId,
          ticketCreationDate: exampleTicketCreationDate,
        },
      });
      await userActionsTimeline.mockUserActions(page, exampleUserActions);
    });

    test.only('should display the case creation session', async ({
      userActionsTimeline,
      page,
    }) => {
      await expect(userActionsTimeline.activeSession).toBeVisible();
      await page.waitForTimeout(35000);
    });

    test('should display the show following sessions button', async ({
      userActionsTimeline,
    }) => {
      await expect(
        userActionsTimeline.showFollowingSessionsbutton
      ).toBeVisible();
    });

    test('should display the show preceding sessions button', async ({
      userActionsTimeline,
    }) => {
      await expect(
        userActionsTimeline.showPrecedingSessionsbutton
      ).toBeVisible();
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

  test.describe('when no user actions data is found', () => {
    test.beforeEach(async ({userActionsTimeline, page}) => {
      await userActionsTimeline.mockUserActions(page, []);
      await userActionsTimeline.load();
    });

    test('should display the user actions error screen', async ({
      userActionsTimeline,
    }) => {
      await expect(userActionsTimeline.userActionsError).toBeVisible();
    });
  });

  test.describe('when an error occurs while fetching user actions', () => {
    test.beforeEach(async ({userActionsTimeline, page}) => {
     await userActionsTimeline.mockUserActionsError(page);
      await userActionsTimeline.load();
    });

    test('should display the user actions error screen', async ({
      userActionsTimeline,
    }) => {
      await expect(userActionsTimeline.userActionsError).toBeVisible();
    });
  });
});
