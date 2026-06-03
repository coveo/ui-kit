import {expect, test} from './fixture';

test.describe('atomic-timeframe-facet', () => {
  test('should render all essential parts', async ({facet}) => {
    await facet.load();

    await test.step('Verify facet container is visible', async () => {
      await expect(facet.facet).toBeVisible();
    });

    await test.step('Verify facet values are visible', async () => {
      await expect(facet.facetValues.first()).toBeVisible();
    });
  });

  test('should toggle collapse and expand when clicking the label button', async ({
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

  test('should display selected value with visual indicator and clear button', async ({
    facet,
  }) => {
    await facet.load({story: 'with-selected-value'});

    await test.step('Verify facet is visible', async () => {
      await expect(facet.facet).toBeVisible();
    });

    await test.step('Verify clear button is visible', async () => {
      await expect(facet.clearButton).toBeVisible();
    });
  });

  test('should display date picker when enabled', async ({facet}) => {
    await facet.load({story: 'with-date-picker'});

    await test.step('Verify date inputs are visible', async () => {
      await expect(facet.facetInputStart).toBeVisible();
      await expect(facet.facetInputEnd).toBeVisible();
    });

    await test.step('Verify apply button is visible', async () => {
      await expect(facet.facetApplyButton).toBeVisible();
    });
  });

  test('should show facet when dependency is met', async ({facet}) => {
    await facet.load({story: 'with-depends-on'});
    await facet.facet.waitFor({state: 'visible'});

    await expect(facet.facet).toBeVisible();
  });
});
