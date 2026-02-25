import {expect, test} from './fixture';

test.describe('atomic-insight-timeframe-facet', () => {
  test('should render all essential parts', async ({facet}) => {
    await facet.load();

    await test.step('Verify facet container is visible', async () => {
      await expect(facet.facet).toBeVisible();
    });

    await test.step('Verify facet label button is visible', async () => {
      await expect(facet.labelButton).toBeVisible();
    });

    await test.step('Verify facet values are visible', async () => {
      await expect(facet.valuesContainer).toBeVisible();
      await expect(facet.facetValues.first()).toBeVisible();
    });
  });

  test('should collapse and hide values when clicking the label button', async ({
    facet,
  }) => {
    await facet.load();

    await test.step('Verify values are initially visible', async () => {
      await expect(facet.valuesContainer).toBeVisible();
    });

    await test.step('Click label button to collapse', async () => {
      await facet.labelButton.click();
    });

    await test.step('Verify values are hidden after collapse', async () => {
      await expect(facet.valuesContainer).not.toBeVisible();
    });

    await test.step('Click label button to expand', async () => {
      await facet.labelButton.click();
    });

    await test.step('Verify values are visible again after expand', async () => {
      await expect(facet.valuesContainer).toBeVisible();
    });
  });

  test('should display selected value with clear button', async ({facet}) => {
    await facet.load({story: 'with-selected-value'});

    await test.step('Verify a value is selected', async () => {
      await expect(facet.selectedValues).toHaveCount(1);
    });

    await test.step('Verify clear button is visible', async () => {
      await expect(facet.clearButton).toBeVisible();
    });
  });
});
