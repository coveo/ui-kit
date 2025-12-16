import {expect, test} from './fixture';

test.describe('atomic-smart-snippet-feedback-modal', () => {
  test.beforeEach(async ({feedbackModal}) => {
    await feedbackModal.load({story: 'default'});
    await feedbackModal.hydrated.waitFor();
  });

  test('should render the component', async ({feedbackModal}) => {
    await expect(feedbackModal.hydrated).toBeVisible();
  });

  test('should open the modal when open button is clicked', async ({
    feedbackModal,
  }) => {
    await feedbackModal.openModalButton.click();
    await expect(feedbackModal.modal).toBeVisible();
  });
});
