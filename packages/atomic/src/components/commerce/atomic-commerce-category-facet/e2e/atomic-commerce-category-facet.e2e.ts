import {expect, test} from './fixture';
import type {CategoryFacetPageObject} from './page-object';

/**
 * Selects a value from the facet search.
 *
 * Waiting for the value to disappear from the list is what tells us the query has been applied:
 * once selected, a value is rendered as the non-interactive selected value, which has no
 * `Inclusion filter on` label.
 */
const selectFromSearch = async (categoryFacet: CategoryFacetPageObject, value: string) => {
  await categoryFacet.searchInput.fill(value);
  await categoryFacet.getSearchResult(value).click();
  await expect(categoryFacet.getFacetValue(value)).toHaveCount(0);
};

test.describe('atomic-commerce-category-facet', () => {
  test.beforeEach(async ({categoryFacet}) => {
    await categoryFacet.load();
  });

  test('should allow to filter by selecting a value', async ({categoryFacet}) => {
    await selectFromSearch(categoryFacet, 'Canoes & Kayaks');

    await expect(categoryFacet.allCategoryButton).toBeVisible();
    await expect(categoryFacet.activeParent).toContainText('Canoes & Kayaks');
    await expect(categoryFacet.getFacetValue('Canoes')).toBeVisible();
    await expect(categoryFacet.getFacetValue('Kayaks')).toBeVisible();
  });

  test('should not allow to interact with the selected value', async ({categoryFacet}) => {
    await selectFromSearch(categoryFacet, 'Canoes & Kayaks');

    await expect(categoryFacet.activeParent).toContainText('Canoes & Kayaks');
    await expect(categoryFacet.activeParent).toHaveAttribute('aria-current', 'true');
    await expect(categoryFacet.activeParent.locator('button')).toHaveCount(0);
  });

  test('should display the selected value in a pill and allow clearing it', async ({
    categoryFacet,
  }) => {
    await selectFromSearch(categoryFacet, 'Canoes & Kayaks');
    await expect(categoryFacet.selectedValuePill).toHaveText('Canoes & Kayaks');

    await categoryFacet.selectedValueClearButton.click();

    await expect(categoryFacet.selectedValue).not.toBeVisible();
    await expect(categoryFacet.allCategoryButton).not.toBeVisible();
  });

  test('should allow to filter by more than one level deep', async ({categoryFacet}) => {
    await selectFromSearch(categoryFacet, 'Canoes & Kayaks');
    await categoryFacet.getFacetValue('Canoes').click();
    await expect(categoryFacet.getFacetValue('Canoes')).toHaveCount(0);

    await categoryFacet.getFacetValue('Classic').click();
    await expect(categoryFacet.getFacetValue('Classic')).toHaveCount(0);

    await expect(categoryFacet.activeParent).toContainText('Classic');
    await expect(categoryFacet.selectedValuePill).toHaveText('Classic');
  });

  test('should allow to deselect a filter with the all category button', async ({
    categoryFacet,
  }) => {
    await selectFromSearch(categoryFacet, 'Canoes & Kayaks');
    await expect(categoryFacet.getFacetValue('Canoes')).toBeVisible();
    await expect(categoryFacet.getFacetValue('Kayaks')).toBeVisible();

    await categoryFacet.allCategoryButton.click();

    await expect(categoryFacet.getFacetValue('Canoes')).not.toBeVisible();
    await expect(categoryFacet.getFacetValue('Kayaks')).not.toBeVisible();
  });

  test('allow to search for a value', async ({categoryFacet, page}) => {
    await categoryFacet.searchInput.fill('o');

    await expect(page.getByText('More matches for o')).toBeVisible();
    await categoryFacet.searchInput.fill('accessories');

    const foundValue = page.getByRole('button', {
      name: /Inclusion filter on Accessories; [0-9]+ results under All Categories/,
    });

    await foundValue.click();

    await expect(categoryFacet.activeParent).toContainText(/accessories/i);
    await expect(categoryFacet.selectedValuePill).toHaveText(/accessories/i);
  });

  test('allow to clear the search input', async ({categoryFacet}) => {
    await categoryFacet.searchInput.fill('Classic');
    await expect(categoryFacet.clearSearchInput).toBeVisible();

    await categoryFacet.clearSearchInput.click();
    await expect(categoryFacet.clearSearchInput).not.toBeVisible();
    await expect(categoryFacet.searchInput).toBeEmpty();
  });

  test('behave correct when searching for a value that does not exist', async ({
    categoryFacet,
    page,
  }) => {
    await categoryFacet.searchInput.fill('non-existing-value');

    await expect(page.getByText('No matches found for non-existing-value')).toBeVisible();
  });
});
