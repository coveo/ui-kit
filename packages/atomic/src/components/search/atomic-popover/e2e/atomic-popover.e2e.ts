import {expect, test} from './fixture';

test.describe('atomic-popover', () => {
  test.beforeEach(async ({popover}) => {
    await popover.load({story: 'default'});
    await popover.hydrated.waitFor();
  });

  test('should open and close popover with button', async ({popover}) => {
    await expect(popover.facetContainer).not.toBeVisible();

    await popover.popoverButton.click();
    await expect(popover.facetContainer).toBeVisible();
    await expect(popover.backdrop).toBeVisible();

    await popover.popoverButton.click();
    await expect(popover.facetContainer).not.toBeVisible();
  });

  test('should close popover with Escape key', async ({popover}) => {
    await popover.popoverButton.click();
    await expect(popover.facetContainer).toBeVisible();

    await popover.page.keyboard.press('Escape');
    await expect(popover.facetContainer).not.toBeVisible();
  });
});
