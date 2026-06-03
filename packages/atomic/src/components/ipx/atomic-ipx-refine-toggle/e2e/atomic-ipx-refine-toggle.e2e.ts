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

  test('should display facets inside the modal when opened', async ({
    ipxRefineToggle,
  }) => {
    await test.step('open the refine modal', async () => {
      await ipxRefineToggle.clickButton();
      await expect(ipxRefineToggle.modal).toHaveAttribute('is-open', '');
    });

    await test.step('verify facets are visible in the modal', async () => {
      await expect(ipxRefineToggle.modalExpandFacetButton).toBeVisible();
    });
  });
});
