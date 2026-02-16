import {expect, test} from './fixture';

test.describe('atomic-ipx-button', () => {
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
