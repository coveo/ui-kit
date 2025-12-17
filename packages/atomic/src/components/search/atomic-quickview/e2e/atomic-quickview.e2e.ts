import {expect, test} from './fixture';

test.describe('Quickview', () => {
  test.beforeEach(async ({quickview}) => {
    await quickview.load({
      args: {
        sandbox:
          'allow-scripts allow-popups allow-top-navigation allow-same-origin',
      },
    });
    await quickview.hydrated.waitFor();
  });

  test('should have clickable button', async ({quickview}) => {
    await expect(quickview.resultButton).toBeVisible();
    await expect(quickview.resultButton).toBeEnabled();
  });

  test('should open modal when button is clicked', async ({quickview}) => {
    await quickview.resultButton.click();
    await expect(quickview.modal).toBeVisible();
  });
});
