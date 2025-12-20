import {expect, test} from './fixture';

test.describe('atomic-insight-refine-toggle', () => {
  test.beforeEach(async ({refineToggle, page}) => {
    await refineToggle.load({
      story: 'default',
    });
    await page.setViewportSize({width: 400, height: 845});
  });

  test.describe('when loaded', () => {
    test('should render the button', async ({refineToggle}) => {
      await expect(refineToggle.button).toBeVisible();
    });

    test('should display the correct button text', async ({refineToggle}) => {
      await expect(refineToggle.button).toHaveText('Sort & Filter');
    });

    test('should have accessible button', async ({refineToggle}) => {
      await expect(refineToggle.button).toHaveAccessibleName('Sort & Filter');
    });
  });

  test.describe('when the button is clicked', () => {
    test.beforeEach(async ({refineToggle}) => {
      await refineToggle.button.click();
    });

    test('should open the refine modal', async ({page}) => {
      const modal = page.locator('atomic-insight-refine-modal');
      await expect(modal).toBeVisible();
    });
  });
});
