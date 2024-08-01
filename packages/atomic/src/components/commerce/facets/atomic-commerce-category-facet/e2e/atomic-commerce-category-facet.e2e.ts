import {test, expect} from './fixture';

test.describe('default', () => {
  test.beforeEach(async ({categoryFacet}) => {
    await categoryFacet.load();
  });

  test('should be A11y compliant', async ({categoryFacet, makeAxeBuilder}) => {
    await categoryFacet.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should allow to filter by selecting and deselecting a value', async ({
    categoryFacet,
  }) => {
    const categoryFacetValueLabel =
      categoryFacet.getFacetValue('Canoes & Kayaks');

    await expect(categoryFacet.allCategoryButton).not.toBeVisible();

    await categoryFacetValueLabel.click();

    await expect(categoryFacet.allCategoryButton).toBeVisible();
    await expect(categoryFacetValueLabel).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(categoryFacet.getFacetValue('Canoes')).toBeVisible();
    await expect(categoryFacet.getFacetValue('Kayaks')).toBeVisible();

    await categoryFacetValueLabel.click();
    await expect(categoryFacet.allCategoryButton).not.toBeVisible();
  });

  test('should allow to filter by more than one level deep', async ({
    categoryFacet,
  }) => {
    await categoryFacet.getFacetValue('Canoes & Kayaks').click();
    await categoryFacet.getFacetValue('Canoes').click();
    const classicCanoes = categoryFacet.getFacetValue('Classic');
    await classicCanoes.click();
    await expect(classicCanoes).toHaveAttribute('aria-pressed', 'true');
  });

  test('should allow to deselect a filter with the all category button', async ({
    categoryFacet,
  }) => {
    const categoryFacetValue = categoryFacet.getFacetValue('Canoes & Kayaks');

    await categoryFacetValue.click();
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
      name: /Accessories \([0-9]+\) in All Categories/,
    });

    await foundValue.click();

    const classicCanoes = categoryFacet.getFacetValue('accessories');
    await expect(classicCanoes).toBeVisible();
    await expect(classicCanoes).toHaveAttribute('aria-pressed', 'true');
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

    await expect(
      page.getByText('No matches found for non-existing-value')
    ).toBeVisible();
  });
});
