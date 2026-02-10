import {expect, test} from './fixture';

test.describe('atomic-ipx-refine-toggle', () => {
  test.beforeEach(async ({ipxRefineToggle}) => {
    await ipxRefineToggle.load();
    await ipxRefineToggle.hydrated.waitFor();
  });

  test('should render with button and icon', async ({ipxRefineToggle}) => {
    await expect(ipxRefineToggle.hydrated).toBeVisible();
    await expect(ipxRefineToggle.button).toBeVisible();
    await expect(ipxRefineToggle.button).toBeEnabled();
    await expect(ipxRefineToggle.icon).toBeVisible();
  });

  test('should open refine modal when button is clicked', async ({
    ipxRefineToggle,
  }) => {
    await ipxRefineToggle.clickButton();
    await expect(ipxRefineToggle.modal).toHaveAttribute('is-open', '');
  });

  test('should display badge when there are active filters', async ({
    ipxRefineToggle,
  }) => {
    await test.step('open the refine modal', async () => {
      await ipxRefineToggle.clickButton();
      await expect(ipxRefineToggle.modal).toHaveAttribute('is-open', '');
    });

    await test.step('select a facet value', async () => {
      await ipxRefineToggle.modalExpandFacetButton.click();
      await ipxRefineToggle.modalFirstCheckbox.click();
    });

    await test.step('verify badge is visible after closing modal', async () => {
      await ipxRefineToggle.page.keyboard.press('Escape');
      await expect(ipxRefineToggle.badge).toBeVisible();
    });
  });
});
