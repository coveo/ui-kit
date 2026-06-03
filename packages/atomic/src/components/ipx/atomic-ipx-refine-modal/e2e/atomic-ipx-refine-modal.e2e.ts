import {expect, test} from './fixture';

test.describe('atomic-ipx-refine-modal', () => {
  test.beforeEach(async ({refineModal}) => {
    await refineModal.load();
    await refineModal.title.waitFor();
  });

  test('should show the modal when it is opened', async ({refineModal}) => {
    await expect(refineModal.title).toBeVisible();
    await expect(refineModal.closeButton).toBeVisible();
    await expect(refineModal.viewResultsButton).toBeVisible();
  });

  test('should hide the modal properly when it is closed', async ({
    refineModal,
  }) => {
    await expect(refineModal.title).toBeVisible();

    await refineModal.closeButton.click();

    await refineModal.hydrated.waitFor({state: 'hidden'});
  });
});
