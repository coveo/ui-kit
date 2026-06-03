import {expect, test} from './fixture';

test.describe('atomic-pager', () => {
  test.beforeEach(async ({pager}) => {
    await pager.load();
    await pager.hydrated.waitFor();
  });

  test('should exist in DOM with correct attributes', async ({pager}) => {
    const pagerElement = pager.hydrated;

    await expect(pagerElement).toBeAttached();
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
});
