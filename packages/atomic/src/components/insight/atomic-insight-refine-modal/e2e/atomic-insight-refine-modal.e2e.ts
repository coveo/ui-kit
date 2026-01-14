import {expect, test} from './fixture';

test.describe('atomic-insight-refine-modal', () => {
  test.beforeEach(async ({refineModal, page}) => {
    await refineModal.load();
    await page.locator('atomic-insight-refine-toggle').waitFor();
  });

  test('should render the modal with title and close button', async ({
    refineModal,
  }) => {
    await expect(refineModal.closeButton).toBeVisible();
    await expect(refineModal.title).toBeVisible();
    await expect(refineModal.title).toHaveText('Filters');
  });

  test('should render the filters section', async ({refineModal}) => {
    await expect(refineModal.filtersTitle).toBeVisible();
    await expect(refineModal.filtersTitle).toHaveText('Filters');
  });

  test('should render the view results button', async ({refineModal}) => {
    await expect(refineModal.viewResultsButton).toBeVisible();
  });
});
