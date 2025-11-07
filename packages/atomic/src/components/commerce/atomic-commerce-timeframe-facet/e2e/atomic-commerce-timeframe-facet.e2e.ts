import {expect, test} from './fixture';

test.describe('atomic-commerce-timeframe-facet', () => {
  test('should complete the full date picker workflow', async ({
    commerceTimeframeFacet,
  }) => {
    await commerceTimeframeFacet.load({
      args: {withDatePicker: true},
    });

    // Fill in date range and apply
    await commerceTimeframeFacet.facetInputStart.fill('2021-01-01');
    await commerceTimeframeFacet.facetInputEnd.fill('2021-01-31');
    await commerceTimeframeFacet.facetApplyButton.click();

    // Verify filter is applied
    await expect(commerceTimeframeFacet.facetClearFilterButton).toBeVisible();

    // Clear the filter
    await commerceTimeframeFacet.facetClearFilterButton.click();

    // Verify filter is cleared
    await expect(commerceTimeframeFacet.facetInputStart).toHaveValue('');
    await expect(commerceTimeframeFacet.facetInputEnd).toHaveValue('');
    await expect(
      commerceTimeframeFacet.facetClearFilterButton
    ).not.toBeVisible();
  });

  test('should complete the full predefined values workflow', async ({
    commerceTimeframeFacet,
  }) => {
    await commerceTimeframeFacet.load({
      args: {withDatePicker: false},
    });

    // Select a predefined value
    const firstValue = commerceTimeframeFacet.facetValues.first();
    await firstValue.click();

    // Verify selection is applied
    await expect(firstValue).toHaveAttribute('aria-pressed', 'true');
    await expect(commerceTimeframeFacet.facetClearFilterButton).toBeVisible();

    // Clear the selection
    await commerceTimeframeFacet.facetClearFilterButton.click();

    // Verify selection is cleared
    await expect(firstValue).toHaveAttribute('aria-pressed', 'false');
    await expect(
      commerceTimeframeFacet.facetClearFilterButton
    ).not.toBeVisible();
  });

  test('should support keyboard navigation for date picker', async ({
    commerceTimeframeFacet,
  }) => {
    await commerceTimeframeFacet.load({
      args: {withDatePicker: true},
    });

    // Test tab navigation and Enter submission
    await commerceTimeframeFacet.facetInputStart.fill('2021-01-01');
    await commerceTimeframeFacet.facetInputEnd.fill('2021-01-31');
    await commerceTimeframeFacet.facetInputEnd.press('Enter');

    await expect(commerceTimeframeFacet.facetClearFilterButton).toBeVisible();
  });
});
