import {expect, test} from './fixture';

test.describe('history toggle', () => {
  test.beforeEach(async ({historyToggle}) => {
    await historyToggle.load();
  });

  test('should display the history toggle button', async ({historyToggle}) => {
    await expect(historyToggle.historyButton).toBeVisible();
  });

  test.describe('with tooltip', () => {
    test.beforeEach(async ({historyToggle}) => {
      await historyToggle.load({story: 'with-tooltip'});
    });

    test('should display tooltip on hover', async ({historyToggle}) => {
      await expect(historyToggle.historyButton).toHaveAttribute(
        'title',
        'View history'
      );
    });
  });
});
