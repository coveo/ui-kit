import {scanPageAccessibility} from '../../../../../playwright-utils/axe-helper';
import {expect, test} from './fixture';

test.describe('atomic-ipx-button', () => {
  test.describe('accessibility', () => {
    test.beforeEach(async ({ipxButton}) => {
      await ipxButton.load();
      await ipxButton.hydrated.waitFor();
    });

    test('should have no accessibility violations at desktop viewport', async ({
      page,
    }) => {
      const results = await scanPageAccessibility(page, {
        viewport: 'desktop',
      });
      expect(results.violations).toEqual([]);
    });

    test('should have no accessibility violations at mobile viewport', async ({
      page,
    }) => {
      const results = await scanPageAccessibility(page, {viewport: 'mobile'});
      expect(results.violations).toEqual([]);
    });
  });

  test.beforeEach(async ({ipxButton}) => {
    await ipxButton.load();
    await ipxButton.hydrated.waitFor();
  });

  test('should render the button', async ({ipxButton}) => {
    await expect(ipxButton.button).toBeVisible();
  });

  test('should display the label', async ({ipxButton}) => {
    await expect(ipxButton.buttonText).toHaveText('Help');
  });

  test('should open the modal when clicked', async ({ipxButton, page}) => {
    await ipxButton.button.click();
    const modal = page.locator('atomic-ipx-modal');
    await expect(modal).toHaveClass(/open/);
  });
});
