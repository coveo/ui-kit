import {expect, test} from './fixture';

test.describe('atomic-quickview-modal', () => {
  test.beforeEach(async ({quickviewModal}) => {
    await quickviewModal.load();
    await quickviewModal.quickviewButton.waitFor();
  });

  test('should open modal when quickview button is clicked', async ({
    quickviewModal,
  }) => {
    await quickviewModal.quickviewButton.click();
    await expect(quickviewModal.modal).toBeVisible();
  });
});
