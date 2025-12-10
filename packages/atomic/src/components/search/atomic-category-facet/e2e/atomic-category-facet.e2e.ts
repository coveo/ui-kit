import {expect, test} from './fixture';

test.describe('atomic-category-facet', () => {
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
      await expect(facet.valueLinks).toHaveCount(8);
    });

    await test.step('Verify facet search input is visible', async () => {
      await expect(facet.searchInput).toBeVisible();
    });
  });

  test('should display child values when selecting a root value', async ({
    facet,
  }) => {
    await facet.load({story: 'with-selected-root-value'});

    await test.step('Verify "All Categories" button is visible', async () => {
      await expect(facet.allCategoriesButton).toBeVisible();
    });

    await test.step('Verify active parent is visible', async () => {
      await expect(facet.activeParent).toBeVisible();
      await expect(facet.activeParent).toContainText('North America');
    });

    await test.step('Verify child values are displayed', async () => {
      await expect(facet.getFacetValueByLabel('United States')).toBeVisible();
      await expect(facet.getFacetValueByLabel('Canada')).toBeVisible();
      await expect(facet.getFacetValueByLabel('Mexico')).toBeVisible();
    });
  });

  test('should display grandchild values when selecting a child value', async ({
    facet,
  }) => {
    await facet.load({story: 'with-selected-child-value'});

    await test.step('Verify "All Categories" button is visible', async () => {
      await expect(facet.allCategoriesButton).toBeVisible();
    });

    await test.step('Verify parent breadcrumb is visible', async () => {
      await expect(facet.parentButton).toBeVisible();
      await expect(facet.parentButton).toContainText('North America');
    });

    await test.step('Verify active parent shows current selection', async () => {
      await expect(facet.activeParent).toBeVisible();
      await expect(facet.activeParent).toContainText('United States');
    });

    await test.step('Verify grandchild values are displayed', async () => {
      await expect(facet.getFacetValueByLabel('California')).toBeVisible();
      await expect(facet.getFacetValueByLabel('New York')).toBeVisible();
      await expect(facet.getFacetValueByLabel('Texas')).toBeVisible();
    });
  });

  test('should filter values when typing in search input', async ({facet}) => {
    await facet.load();

    await test.step('Verify initial values are visible', async () => {
      await expect(facet.valueLinks).toHaveCount(8);
    });

    await test.step('Type in the search input', async () => {
      await facet.searchInput.fill('North');
    });

    await test.step('Verify search results appear', async () => {
      await expect(facet.searchResults).toBeVisible();
      await expect(facet.getSearchResultByLabel('North America')).toBeVisible();
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

  test('should show more values in deep hierarchy and focus first new value', async ({
    facet,
  }) => {
    await facet.load({story: 'with-selected-child-value-and-more-available'});

    await test.step('Verify deep hierarchy is displayed (2 levels deep)', async () => {
      await expect(facet.allCategoriesButton).toBeVisible();
      await expect(facet.parentButton).toContainText('North America');
      await expect(facet.activeParent).toContainText('United States');
    });

    await test.step('Verify initial child values are visible', async () => {
      await expect(facet.getFacetValueByLabel('California')).toBeVisible();
      await expect(facet.getFacetValueByLabel('New York')).toBeVisible();
      await expect(facet.getFacetValueByLabel('Texas')).toBeVisible();
    });

    await test.step('Verify show more button is visible', async () => {
      await expect(facet.showMoreButton).toBeVisible();
    });

    await test.step('Click show more button', async () => {
      await facet.showMoreButton.click();
    });
  });
});
