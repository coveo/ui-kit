import {test, expect} from './fixture';

test.describe('default', () => {
  test.beforeEach(async ({facet}) => {
    await facet.load();
  });

  test('should be A11y compliant', async ({facet, makeAxeBuilder}) => {
    await facet.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should allow to filter by selecting and deselecting a value', async ({
    facet,
  }) => {
    const facetValueLabel = facet.getFacetValue('Nike');
    const facetValueBtn = facet.getFacetValueButton('Nike');

    await expect(facetValueBtn).not.toBeChecked();
    await facetValueLabel.click();

    await expect(facetValueBtn).toBeChecked();

    await facetValueLabel.click();
    await expect(facetValueBtn).not.toBeChecked();
  });

  test('should allow to filter by selecting multiple values', async ({
    facet,
    page,
  }) => {
    const firstValueBtn = facet.getFacetValueButton('Nike');
    const secondValueBtn = facet.getFacetValueButton('Adidas');

    await expect(firstValueBtn).not.toBeChecked();
    await expect(secondValueBtn).not.toBeChecked();
    await firstValueBtn.click();
    await secondValueBtn.click();

    await expect(firstValueBtn).toBeChecked();
    await expect(secondValueBtn).toBeChecked();
    await expect(page.getByText('Clear 2 filters')).toBeVisible();
  });

  test('should allow to deselect a filter with the clear button', async ({
    facet,
  }) => {
    const facetValueLabel = facet.getFacetValue('Nike');

    await expect(facet.clearFilter).toHaveCount(0);

    await facetValueLabel.click();

    await expect(facet.clearFilter).toBeVisible();
    await facet.clearFilter.click();

    await expect(facet.clearFilter).toHaveCount(0);
  });

  test('should allow to show more values and show less values', async ({
    facet,
    page,
  }) => {
    await expect(facet.showMore).toBeVisible();
    await expect(facet.showLess).not.toBeVisible();

    await expect(page.getByRole('listitem')).toHaveCount(8);

    await facet.showMore.click();

    await expect(facet.showLess).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveCount(16);
    await facet.showLess.click();
    await expect(page.getByRole('listitem')).toHaveCount(8);
    await expect(facet.showLess).not.toBeVisible();
  });

  test('allow to search for a value', async ({facet, page}) => {
    await facet.searchInput.fill('n');

    expect(await page.getByRole('listitem').count()).toBeGreaterThanOrEqual(8);
    await expect(page.getByText('More matches for n')).toBeVisible();
    await facet.searchInput.fill('nike');

    await facet.getFacetValue('Nike').click();

    await expect(facet.getFacetValueButton('Nike')).toBeChecked();
  });

  test('allow to clear the search input', async ({facet}) => {
    await facet.searchInput.fill('nike');
    await expect(facet.clearSearchInput).toBeVisible();

    await facet.clearSearchInput.click();
    await expect(facet.clearSearchInput).not.toBeVisible();
    await expect(facet.searchInput).toBeEmpty();
  });

  test('behave correct when searching for a value that does not exist', async ({
    facet,
    page,
  }) => {
    await facet.searchInput.fill('non-existing-value');

    await expect(
      page.getByText('No matches found for non-existing-value')
    ).toBeVisible();
  });
});
