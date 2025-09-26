import {expect, test} from './fixture';

test.describe('atomic-pager', () => {
  test.beforeEach(async ({pager}) => {
    await pager.load();
    await pager.hydrated.waitFor();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should exist in DOM with correct attributes', async ({pager}) => {
    const pagerElement = pager.hydrated;

    await expect(pagerElement).toBeAttached();
  });

  test('should navigate with next button', async ({pager}) => {
    await expect(pager.currentPageButton).toHaveAttribute(
      'aria-label',
      'Page 1'
    );

    await pager.nextButton.click();
    await expect(pager.currentPageButton).toHaveAttribute(
      'aria-label',
      'Page 2'
    );
  });

  test('should navigate with previous button', async ({pager}) => {
    await pager.nextButton.click();
    await expect(pager.currentPageButton).toHaveAttribute(
      'aria-label',
      'Page 2'
    );

    await pager.previousButton.click();
    await expect(pager.currentPageButton).toHaveAttribute(
      'aria-label',
      'Page 1'
    );
  });

  test('should navigate to specific page', async ({pager}) => {
    await expect(pager.currentPageButton).toHaveAttribute(
      'aria-label',
      'Page 1'
    );

    await pager.pageButton(3).click();
    await expect(pager.currentPageButton).toHaveAttribute(
      'aria-label',
      'Page 3'
    );
  });
});
