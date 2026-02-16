import {expect, test} from './fixture';

test.describe('atomic-popover', () => {
  test.beforeEach(async ({popover}) => {
    await popover.load({story: 'default'});
    await popover.hydrated.waitFor();
  });

  test('should open and close popover with button', async ({popover}) => {
    await test.step('Verify initial closed state', async () => {
      await expect(popover.facetContainer).not.toBeVisible();
    });

    await test.step('Open popover', async () => {
      await popover.popoverButton.click();
      await expect(popover.facetContainer).toBeVisible();
      await expect(popover.backdrop).toBeVisible();
    });

    await test.step('Close popover', async () => {
      await popover.popoverButton.click();
      await expect(popover.facetContainer).not.toBeVisible();
    });
  });

  test('should close popover with Escape key', async ({popover}) => {
    await test.step('Open popover', async () => {
      await popover.popoverButton.click();
      await expect(popover.facetContainer).toBeVisible();
    });

    await test.step('Close popover with Escape key', async () => {
      await popover.page.keyboard.press('Escape');
      await expect(popover.facetContainer).not.toBeVisible();
    });
  });
});
