import {expect, test} from './fixture';

test.describe('atomic-color-facet', () => {
  test('should render all essential parts', async ({facet}) => {
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

  test('should filter values when typing in search input', async ({facet}) => {
    await facet.load();

    await test.step('Verify all values are initially visible', async () => {
      await expect(facet.valueBoxes).toHaveCount(8);
    });

    await test.step('Type in the search input', async () => {
      await facet.searchInput.fill('power');
    });

    await test.step('Verify only matching values appear in search results', async () => {
      await expect(facet.getFacetValueByLabel('Powerpoint')).toBeVisible();
      await expect(facet.getFacetValueByLabel('PDF')).toBeVisible();
      await expect(facet.getFacetValueByLabel('Email')).not.toBeVisible();
    });
  });

  test('should display selected value with visual indicator and clear button', async ({
    facet,
  }) => {
    await facet.load({story: 'with-selected-value'});

    await test.step('Verify selected value has selected styling', async () => {
      await expect(facet.selectedValueBoxes).toHaveCount(1);
      await expect(facet.selectedValueBoxes.first()).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });

    await test.step('Verify clear button is visible', async () => {
      await expect(facet.clearButton).toBeVisible();
    });
  });

  test('should render checkboxes when display-values-as is checkbox', async ({
    facet,
  }) => {
    await facet.load({story: 'checkbox-display'});

    await test.step('Verify facet is loaded', async () => {
      await expect(facet.facet).toBeVisible();
    });

    await test.step('Verify checkboxes are rendered instead of boxes', async () => {
      await expect(facet.valueCheckboxes.first()).toBeVisible();
    });
  });

  test('should collapse and hide values when clicking the label button', async ({
    facet,
  }) => {
    await facet.load();

    await test.step('Verify values are initially visible', async () => {
      await expect(facet.values).toBeVisible();
    });

    await test.step('Click label button to collapse', async () => {
      await facet.labelButton.click();
    });

    await test.step('Verify values are hidden after collapse', async () => {
      await expect(facet.values).not.toBeVisible();
    });

    await test.step('Click label button to expand', async () => {
      await facet.labelButton.click();
    });

    await test.step('Verify values are visible again after expand', async () => {
      await expect(facet.values).toBeVisible();
    });
  });
});
