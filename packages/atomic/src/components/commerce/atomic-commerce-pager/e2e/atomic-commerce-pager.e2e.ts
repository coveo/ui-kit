import {expect, test} from './fixture';

test.describe('atomic-commerce-pager', () => {
  test.beforeEach(async ({pager}) => {
    await pager.load();
  });

  test('should render pager with navigation elements', async ({pager}) => {
    await expect(pager.pages).toHaveCount(5);
    await expect(pager.previousButton).toBeVisible();
    await expect(pager.nextButton).toBeVisible();
    await expect(pager.numericButton(1)).toHaveAttribute(
      'part',
      expect.stringContaining('active-page-button')
    );
  });

  test('should navigate through pages and update URL', async ({
    pager,
    page,
  }) => {
    await expect(pager.numericButton(1)).toHaveAttribute(
      'part',
      expect.stringContaining('active-page-button')
    );

    await pager.nextButton.click();
    await expect(pager.numericButton(2)).toHaveAttribute(
      'part',
      expect.stringContaining('active-page-button')
    );
    expect(page.url()).toContain('#page=1');

    await pager.numericButton(5).click();
    await expect(pager.numericButton(5)).toHaveAttribute(
      'part',
      expect.stringContaining('active-page-button')
    );
    expect(page.url()).toContain('#page=4');

    await pager.previousButton.click();
    await expect(pager.numericButton(4)).toHaveAttribute(
      'part',
      expect.stringContaining('active-page-button')
    );
  });
});
