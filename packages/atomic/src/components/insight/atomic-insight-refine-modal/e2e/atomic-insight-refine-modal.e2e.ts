import {expect, test} from './fixture';

test.describe('atomic-insight-refine-modal', () => {
  test.beforeEach(async ({refineModal, page}) => {
    await refineModal.load();
    await page.locator('atomic-insight-refine-toggle').waitFor();
  });

  test('should render the modal properly after the user opens it', async ({
    refineModal,
  }) => {
    await expect(refineModal.title).toBeVisible();
    await expect(refineModal.closeButton).toBeVisible();
    await expect(refineModal.viewResultsButton).toBeVisible();
  });

  test('should close the modal properly after the user closes it', async ({
    refineModal,
  }) => {
    await expect(refineModal.title).toBeVisible();

    await refineModal.closeButton.click();

    await refineModal.hydrated.waitFor({state: 'hidden'});
  });
});
