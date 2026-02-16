/* eslint-disable @cspell/spellchecker */
import {expect, test} from './fixture';

test.describe('atomic-commerce-facet', () => {
  test.beforeEach(async ({facet}) => {
    await facet.load();
  });

  test('should allow to filter by selecting and deselecting a value', async ({
    facet,
  }) => {
    const firstFacetValue = facet.getFacetValueByPosition(0);
    const firstFacetValueBtn = await facet.getFacetValueButtonByPosition(0);

    await expect(firstFacetValueBtn).not.toBeChecked();
    await firstFacetValue.click();

    await expect(firstFacetValueBtn).toBeChecked();

    await firstFacetValue.click();
    await expect(firstFacetValueBtn).not.toBeChecked();
  });

  test('should allow to filter by selecting multiple values', async ({
    facet,
    page,
  }) => {
    const firstValueBtn = facet.getFacetValueButtonByPosition(0);
    const secondValueBtn = facet.getFacetValueButtonByPosition(1);

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
    const facetValueLabel = facet.getFacetValueByPosition(0);

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
    await facet.searchInput.fill('o');

    expect(await page.getByRole('listitem').count()).toBeGreaterThanOrEqual(8);
    await expect(page.getByText('More matches for o')).toBeVisible();
    await facet.searchInput.fill('Ecco');

    await facet.getFacetValueByLabel('Ecco').click();

    await expect(facet.getFacetValueButtonByLabel('Ecco')).toBeChecked();
  });

  test('allow to clear the search input', async ({facet}) => {
    await facet.searchInput.fill('Ecco');
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
