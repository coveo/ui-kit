import {expect, test} from './fixture';

test.describe('atomic-insight-numeric-facet', () => {
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
});

test.describe('atomic-insight-numeric-facet with selected value', () => {
  test('should display selected value with clear button', async ({facet}) => {
    await facet.load({story: 'with-selected-value'});

    await test.step('Verify selected checkbox is checked', async () => {
      await expect(facet.selectedCheckboxes).toHaveCount(1);
    });

    await test.step('Verify clear button is visible', async () => {
      await expect(facet.clearButton).toBeVisible();
    });
  });
});

test.describe('atomic-insight-numeric-facet with input', () => {
  test('should render input fields', async ({facet}) => {
    await facet.load({story: 'with-input-integer'});

    await test.step('Verify input fields are visible', async () => {
      await expect(facet.minInput).toBeVisible();
      await expect(facet.maxInput).toBeVisible();
    });

    await test.step('Verify apply button is visible', async () => {
      await expect(facet.applyButton).toBeVisible();
    });
  });
});

test.describe('atomic-insight-numeric-facet display as link', () => {
  test('should render values as links', async ({facet}) => {
    await facet.load({story: 'display-as-link'});

    await test.step('Verify link values are rendered', async () => {
      await expect(facet.facetLinkValues.first()).toBeVisible();
    });
  });
});
