import {expect, test} from './fixture';

test.describe('atomic-color-facet', () => {
  test('should render the facet with all essential parts', async ({facet}) => {
    await facet.load();

    await test.step('Verify facet container is visible', async () => {
      await expect(facet.facet).toBeVisible();
    });

    await test.step('Verify facet label button is visible', async () => {
      await expect(facet.labelButton).toBeVisible();
    });

    await test.step('Verify facet values are visible', async () => {
      await expect(facet.values).toBeVisible();
      await expect(facet.valueBoxes).toHaveCount(8);
    });

    await test.step('Verify facet search input is visible', async () => {
      await expect(facet.searchInput).toBeVisible();
    });
  });

  test('should be able to click on a facet value', async ({facet}) => {
    await facet.load();

    await test.step('Click on the first facet value', async () => {
      // Verify value is clickable and accessible
      const firstValue = facet.valueBoxes.first();
      await expect(firstValue).toBeEnabled();
      await expect(firstValue).toHaveAttribute('aria-label', /Email/);
      await firstValue.click();
      // Verify the click was processed without error
      // The component should still be visible after interaction
      await expect(facet.facet).toBeVisible();
    });
  });

  test('should show facet search results when typing in search input', async ({
    facet,
  }) => {
    await facet.load();

    await test.step('Type in the search input', async () => {
      await facet.searchInput.fill('power');
    });

    await test.step('Verify Powerpoint appears in search results', async () => {
      await expect(facet.getFacetValueByLabel('Powerpoint')).toBeVisible();
    });
  });
});
