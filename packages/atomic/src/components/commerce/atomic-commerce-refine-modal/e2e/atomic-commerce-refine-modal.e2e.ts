import {expect, test} from './fixture';

test.describe('atomic-commerce-refine-modal', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/iframe.html?id=atomic-commerce-refine-toggle--default');
    await page.locator('atomic-commerce-refine-toggle').waitFor();
    await expect(
      page.getByRole('button', {name: 'Sort & Filter'})
    ).toBeVisible();
    await page.locator('atomic-commerce-refine-toggle').click();
  });

  test('should be able to close the modal', async ({commerceRefineModal}) => {
    await commerceRefineModal.closeButton.click();
    await commerceRefineModal.hydrated.waitFor({state: 'hidden'});
  });

  test('should be able to switch sort', async ({page}) => {
    await page.getByText('Sort', {exact: true}).waitFor();
    await page
      .getByLabel('Sort by', {exact: true})
      .selectOption('Price (Low to High)');

    const selectedSort = await page
      .getByLabel('Sort by', {exact: true})
      .inputValue();
    expect(selectedSort).toBe('Price (Low to High)');
  });

  test('should be able to select a facet', async ({page}) => {
    await page.getByLabel('Expand the Brand facet').click();
    await page.getByTitle('Nautica').click();
    await page.getByLabel('Clear 1 filter for the Brand facet').waitFor();
  });
});
