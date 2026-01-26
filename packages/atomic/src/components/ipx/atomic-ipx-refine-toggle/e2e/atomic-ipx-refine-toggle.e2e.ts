import {expect, test} from './fixture';

test.describe('atomic-ipx-refine-toggle', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:6006/iframe.html?id=atomic-ipx-refine-toggle--default'
    );
    await page.waitForSelector('atomic-ipx-refine-toggle', {state: 'attached'});
  });

  test.describe('Happy path', () => {
    test('should render the component', async ({ipxRefineToggle}) => {
      await expect(ipxRefineToggle.component).toBeVisible();
    });

    test('should render the filter button', async ({ipxRefineToggle}) => {
      await expect(ipxRefineToggle.button).toBeVisible();
    });

    test('should render the filter icon', async ({ipxRefineToggle}) => {
      await expect(ipxRefineToggle.icon).toBeVisible();
    });

    test('should enable the button when there are search results', async ({
      ipxRefineToggle,
    }) => {
      await expect(ipxRefineToggle.button).toBeEnabled();
    });

    test('should open refine modal when button is clicked', async ({
      ipxRefineToggle,
      page,
    }) => {
      await ipxRefineToggle.clickButton();
      const modal = page.locator('atomic-ipx-refine-modal');
      await expect(modal).toHaveAttribute('is-open', 'true');
    });
  });

  test.describe('Accessibility', () => {
    test('should have an accessible button', async ({ipxRefineToggle}) => {
      await expect(ipxRefineToggle.button).toHaveAccessibleName();
    });

    test('should be keyboard navigable', async ({ipxRefineToggle, page}) => {
      await page.keyboard.press('Tab');
      await expect(ipxRefineToggle.button).toBeFocused();
    });

    test('should be operable with keyboard', async ({
      ipxRefineToggle,
      page,
    }) => {
      await ipxRefineToggle.button.focus();
      await page.keyboard.press('Enter');
      const modal = page.locator('atomic-ipx-refine-modal');
      await expect(modal).toHaveAttribute('is-open', 'true');
    });
  });

  test.describe('Badge display', () => {
    test('should display badge when there are active filters', async ({
      page,
      ipxRefineToggle,
    }) => {
      // Click button to open modal
      await ipxRefineToggle.clickButton();

      // Select a facet value
      const facetValue = page
        .locator('atomic-facet')
        .first()
        .locator('button')
        .first();
      await facetValue.click();

      // Close modal
      const closeButton = page.locator(
        'atomic-ipx-refine-modal [part="close-button"]'
      );
      await closeButton.click();

      // Check if badge is displayed
      await expect(ipxRefineToggle.badge).toBeVisible();
    });
  });
});
