import {test, expect} from './fixture';

test.describe('Quickview', () => {
  test.beforeEach(async ({quickview}) => {
    await quickview.load();
  });

  test('should render the quickview button', async ({quickview}) => {
    await expect(quickview.resultButton).toBeVisible();
  });

  test.describe('when the quickview button is clicked', () => {
    test.beforeEach(async ({quickview}) => {
      await quickview.resultButton.click();
    });

    test('should display the quickview modal', async ({quickview}) => {
      await expect(quickview.modal).toBeVisible();
    });

    test('should display the keywords highlight', async ({quickview}) => {
      await expect(quickview.keywordsHighlight).toBeVisible();
    });

    test.describe('when the toggle keyword navigation button is clicked', () => {
      test.beforeEach(async ({quickview}) => {
        await quickview.toggleKeywordNavigationButton.click();
      });

      test('should hide the keywords navigation', async ({quickview}) => {
        await expect(quickview.keywordsHighlight).not.toBeVisible();
      });
    });
  });
});
