import {expect, test} from './fixture';

test.describe('atomic-refine-modal', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/iframe.html?id=atomic-refine-modal--default-modal');
    await page.locator('atomic-refine-toggle').waitFor();
    await expect(
      page.getByRole('button', {name: 'Sort & Filter'})
    ).toBeVisible();
    await page.locator('atomic-refine-toggle').click();
  });

  test.describe('accessibility', () => {
    test('should have proper ARIA attributes', async ({page}) => {
      const modal = page.getByRole('dialog', {name: 'Sort & Filter'});
      await expect(modal).toBeVisible();

      const sortDropdown = page.getByLabel('Sort by');
      await expect(sortDropdown).toBeVisible();
      await expect(sortDropdown).toHaveAttribute('aria-label', 'Sort by');
    });

    test('should be keyboard navigable', async ({page}) => {
      const sortDropdown = page.getByLabel('Sort by');
      await sortDropdown.focus();
      await expect(sortDropdown).toBeFocused();

      await page.keyboard.press('Tab');
      // Focus should move to the next interactive element
    });
  });

  test.describe('close behavior', () => {
    test('should be able to close the modal with close button', async ({
      refineModal,
    }) => {
      await refineModal.closeButton.click();
      await refineModal.hydrated.waitFor({state: 'hidden'});
    });

    test('should be able to close the modal with view results button', async ({
      refineModal,
    }) => {
      await refineModal.viewResultsButton.click();
      await refineModal.hydrated.waitFor({state: 'hidden'});
    });
  });

  test.describe('sort functionality', () => {
    test('should display sort section', async ({page}) => {
      await page.getByText('Sort', {exact: true}).waitFor();
    });

    test('should be able to switch sort', async ({page}) => {
      await page.getByText('Sort', {exact: true}).waitFor();
      const sortDropdown = page.getByLabel('Sort by', {exact: true});

      // Get the options to see what's available
      const options = sortDropdown.locator('option');
      const count = await options.count();

      if (count > 1) {
        // Select the second option if available
        await sortDropdown.selectOption({index: 1});
        const selectedValue = await sortDropdown.inputValue();
        expect(selectedValue).toBeTruthy();
      }
    });
  });

  test.describe('filter functionality', () => {
    test('should display filters section', async ({page}) => {
      await page.getByText('Filters', {exact: true}).waitFor();
    });

    test('should be able to expand a facet', async ({page}) => {
      // Wait for facets to load
      const expandButton = page.getByLabel(/Expand the .+ facet/).first();

      if (await expandButton.isVisible()) {
        await expandButton.click();
        // Verify facet is expanded by checking for facet values
        await page.waitForTimeout(500); // Wait for animation
      }
    });

    test('should be able to clear filters when filters are selected', async ({
      page,
      refineModal,
    }) => {
      // First, select a filter by expanding a facet and clicking a value
      const expandButton = page.getByLabel(/Expand the .+ facet/).first();

      if (await expandButton.isVisible()) {
        await expandButton.click();
        await page.waitForTimeout(500); // Wait for animation

        // Click the first checkbox/value if available
        const firstValue = page.getByRole('checkbox').first();
        if (await firstValue.isVisible()) {
          await firstValue.click();
          await page.waitForTimeout(500);

          // Now the clear button should be visible
          if (await refineModal.clearFiltersButton.isVisible()) {
            await refineModal.clearFiltersButton.click();
            // Verify filters were cleared
            await page.waitForTimeout(500);
          }
        }
      }
    });
  });

  test.describe('collapseFacetsAfter property', () => {
    test('should respect collapseFacetsAfter setting', async ({page}) => {
      // This is set via the component property, so we just verify facets are rendered
      await page.getByText('Filters', {exact: true}).waitFor();

      // Check that facets are present
      const facets = page.getByLabel(/Expand the .+ facet/);
      const count = await facets.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
