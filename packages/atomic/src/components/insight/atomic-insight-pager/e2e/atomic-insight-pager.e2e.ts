import {expect, test} from './fixture';

test.describe('atomic-insight-pager', () => {
  test.beforeEach(async ({pager}) => {
    await pager.load();
    await pager.hydrated.waitFor();
  });

  test('should exist in DOM with correct attributes', async ({pager}) => {
    const pagerElement = pager.hydrated;

    await expect(pagerElement).toBeAttached();
  });

  test('should display page buttons when there are multiple pages', async ({
    pager,
  }) => {
    await expect(pager.pageButtons.first()).toBeVisible();
    expect(await pager.pageButtons.count()).toBeGreaterThan(0);
  });

  test('should navigate through pages', async ({pager}) => {
    await expect(pager.currentPageButton).toHaveAttribute(
      'aria-label',
      'Page 1'
    );

    await pager.nextButton.click();
    await expect(pager.currentPageButton).toHaveAttribute(
      'aria-label',
      'Page 2'
    );

    await pager.pageButton(5).click();
    await expect(pager.currentPageButton).toHaveAttribute(
      'aria-label',
      'Page 5'
    );

    await pager.previousButton.click();
    await expect(pager.currentPageButton).toHaveAttribute(
      'aria-label',
      'Page 4'
    );
  });

  test('should disable previous button on first page', async ({pager}) => {
    await expect(pager.currentPageButton).toHaveAttribute(
      'aria-label',
      'Page 1'
    );
    await expect(pager.previousButton).toBeDisabled();
  });

  test('should have navigation element with proper role', async ({pager}) => {
    const navigation = pager.hydrated.locator('nav');
    await expect(navigation).toBeVisible();
    await expect(navigation).toHaveAttribute('aria-label', 'Pagination');
  });
});
