import {test, expect} from './fixture';

const followingSessionsActions = [
  {
    name: 'CUSTOM',
    value:
      '{"event_type":"example","event_value":"exampleCustomAction","origin_level_1":"default"}',
    time: new Date('2024-09-02T15:30:00Z').valueOf(),
  },
  {
    name: 'CUSTOM',
    value:
      '{"event_type":"example","event_value":"exampleCustomAction","origin_level_1":"default"}',
    time: new Date('2024-09-01T15:30:00Z').valueOf(),
  },
];

const ticketCreationSessionActions = [
  {
    name: 'CUSTOM',
    value:
      '{"event_type":"errors","event_value":"One","origin_level_1":"default","origin_level_2":"default"}',
    time: new Date('2024-08-30T00:10:00Z').valueOf(),
  },
  {
    name: 'CUSTOM',
    value:
      '{"event_type":"errors","event_value":"Two","origin_level_1":"default","origin_level_2":"default"}',
    time: new Date('2024-08-30T00:12:00Z').valueOf(),
  },
  {
    name: 'CUSTOM',
    value:
      '{"event_type":"errors","event_value":"Three","origin_level_1":"default","origin_level_2":"default"}',
    time: new Date('2024-08-29T23:45:00Z').valueOf(),
  },
];

const precedingSessionsActions = [
  {
    name: 'CUSTOM',
    value:
      '{"event_type":"example","event_value":"exampleCustomAction","origin_level_1":"default"}',
    time: new Date('2024-08-29T15:40:00Z').valueOf(),
  },
  {
    name: 'CUSTOM',
    value:
      '{"event_type":"example","event_value":"exampleCustomAction","origin_level_1":"default"}',
    time: new Date('2024-08-28T15:40:00Z').valueOf(),
  },
];

const exampleUserActions = [
  ...followingSessionsActions,
  ...ticketCreationSessionActions,
  ...precedingSessionsActions,
];

const exampleUserId = 'exampleUserId';
const exampleTicketCreationDate = encodeURIComponent('2024-08-30');

test.describe('user actions timeline', () => {
  test.describe('when user actions data is found', () => {
    test.beforeEach(async ({userActionsTimeline, page}) => {
      await userActionsTimeline.load({
        args: {
          userId: exampleUserId,
          ticketCreationDateTime: exampleTicketCreationDate,
        },
      });
      await userActionsTimeline.mockUserActions(page, exampleUserActions);
    });

    test('should display the ticket creation session', async ({
      userActionsTimeline,
    }) => {
      await expect(userActionsTimeline.activeSession).toBeVisible();
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

    test.describe('when clicking the show more actions button', () => {
      test('should properly show more actions', async ({
        userActionsTimeline,
      }) => {
        await expect(userActionsTimeline.showMoreActionsButton).toBeVisible();
        await expect(userActionsTimeline.moreActionsSection).not.toBeVisible();
        await userActionsTimeline.showMoreActionsButton.click();
        await userActionsTimeline.showMoreActionsButton.waitFor({
          state: 'hidden',
        });

        await expect(userActionsTimeline.moreActionsSection).toBeVisible();
      });
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
