import {test, expect} from './fixture';

test.describe('default', () => {
  test.beforeEach(async ({numericFacet}) => {
    await numericFacet.load();
  });

  test('should be A11y compliant', async ({numericFacet, makeAxeBuilder}) => {
    await numericFacet.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should allow to select and deselect a range', async ({
    numericFacet,
  }) => {
    const facetValueLabel = numericFacet.getFacetValue('12', '4,200');
    const facetValueBtn = numericFacet.getFacetValueButton('12', '4,200');

    await expect(facetValueBtn).not.toBeChecked();
    await facetValueLabel.click();

    await expect(facetValueBtn).toBeChecked();

    await facetValueLabel.click();
    await expect(facetValueBtn).not.toBeChecked();
  });

  test('should allow to deselect a filter with the clear button', async ({
    numericFacet,
  }) => {
    const facetValueLabel = numericFacet.getFacetValue('12', '4,200');

    await facetValueLabel.click();

    await expect(numericFacet.clearFilter).toBeVisible();
    await numericFacet.clearFilter.click();

    await expect(numericFacet.clearFilter).toHaveCount(0);
  });

  test('should allow to filter by entering a valid minimum and maximum value', async ({
    numericFacet,
  }) => {
    await numericFacet.inputMinimum.fill('100');
    await numericFacet.inputMaximum.fill('200');
    await numericFacet.inputApply.click();
    await expect(numericFacet.clearFilter).toBeVisible();
  });

  test('should prevent from filtering by entering an invalid minimum and maximum value', async ({
    numericFacet,
  }) => {
    await numericFacet.inputMinimum.fill('200');
    await numericFacet.inputMaximum.fill('100');
    await numericFacet.inputApply.click();
    await expect(numericFacet.clearFilter).toHaveCount(0);
  });
});
