import {expect, test} from './fixture';

const exampleUserId = 'exampleUserId';
const exampleTicketCreationDate = encodeURIComponent('2024-08-30');

test.describe('user actions toggle', () => {
  test.beforeEach(async ({userActionsToggle}) => {
    await userActionsToggle.load({
      args: {
        userId: exampleUserId,
        ticketCreationDateTime: exampleTicketCreationDate,
      },
    });
  });

  test('should display the user actions toggle button', async ({
    userActionsToggle,
  }) => {
    await expect(userActionsToggle.atomicInsightHistoryToggle).toBeVisible();
  });

  test.describe('when clicking the user actions toggle', () => {
    test('should display the user actions timeline', async ({
      userActionsToggle,
    }) => {
      await userActionsToggle.atomicInsightHistoryToggle.click();
      await expect(
        userActionsToggle.atomicInsightUserActionsTimeline
      ).toBeVisible();
    });
  });
});
