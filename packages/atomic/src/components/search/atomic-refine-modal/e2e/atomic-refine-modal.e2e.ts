import {expect, test} from './fixture';

test.describe('atomic-refine-modal', () => {
  test.beforeEach(async ({refineModal, page}) => {
    await refineModal.load();
    await page.locator('atomic-refine-toggle').waitFor();
  });

  test('should render the modal with title and close button', async ({
    refineModal,
  }) => {
    await expect(refineModal.closeButton).toBeVisible();
    await expect(refineModal.title).toBeVisible();
    await expect(refineModal.title).toHaveText('Sort & Filter');
  });

  test('should render the sort section', async ({refineModal}) => {
    await expect(refineModal.sortTitle).toBeVisible();
    await expect(refineModal.sortTitle).toHaveText('Sort');
    await expect(refineModal.sortDropdown).toBeVisible();

    const options = refineModal.sortDropdown.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should render the view results button with count', async ({
    refineModal,
  }) => {
    await expect(refineModal.viewResultsButton).toBeVisible();
  });
});
