import {testInsight, expect} from './fixture';

const exampleUserId = 'exampleUserId';
const exampleTicketCreateDateTime = encodeURIComponent('2024-08-30');

testInsight.use({
  options: {
    userId: exampleUserId,
    ticketCreationDateTime: exampleTicketCreateDateTime,
  },
});

testInsight.describe('quantic user actions toggle', () => {
  testInsight.describe('when opening the user action modal', () => {
    testInsight(
      'should open the user actions timeline and log analytics',
      async ({userActionsToggle}) => {
        await expect(userActionsToggle.userActionsModal).not.toBeVisible();
        const uaPromise = userActionsToggle.waitForOpenUserActionsUaAnalytics();
        await userActionsToggle.userActionsToggleButton.click();
        await expect(userActionsToggle.userActionsModal).toBeVisible();
        await uaPromise;
      }
    );
  });

  testInsight.describe('when closing the user action modal', () => {
    testInsight(
      'should close the user actions timeline',
      async ({userActionsToggle}) => {
        await expect(userActionsToggle.userActionsModal).not.toBeVisible();
        await userActionsToggle.userActionsToggleButton.click();
        await expect(userActionsToggle.userActionsModal).toBeVisible();
        await userActionsToggle.userActionsModalCloseButton.click();
        await expect(userActionsToggle.userActionsModal).not.toBeVisible();
      }
    );
  });
});
