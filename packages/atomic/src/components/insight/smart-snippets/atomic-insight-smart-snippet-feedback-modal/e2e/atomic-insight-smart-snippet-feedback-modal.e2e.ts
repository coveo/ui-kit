import {expect, test} from './fixture';

test.describe('atomic-insight-smart-snippet-feedback-modal', () => {
  test.beforeEach(async ({feedbackModal}) => {
    await feedbackModal.load({story: 'default'});
    await feedbackModal.hydrated.waitFor({state: 'attached'});
  });

  test('should open the modal when open button is clicked', async ({
    feedbackModal,
  }) => {
    await feedbackModal.openModalButton.click();
    await expect(feedbackModal.feedbackOptions).toBeVisible();
    await expect(feedbackModal.explainWhyHeading).toBeVisible();
    await expect(feedbackModal.selectReasonHeading).toBeVisible();
  });
});
