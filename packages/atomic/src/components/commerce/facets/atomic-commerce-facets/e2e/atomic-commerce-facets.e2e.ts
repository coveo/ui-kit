import {test, expect} from './fixture';

test.describe('default', async () => {
  test('should be A11y compliant', async ({facets, makeAxeBuilder}) => {
    await facets.load();
    await facets.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();

    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should display facets', async ({facets}) => {
    await facets.load();
    await expect(facets.standardFacets.first()).toBeVisible();
    await expect(facets.numericFacets.first()).toBeVisible();
    await expect(facets.categoryFacets.first()).toBeVisible();
  });

  test('should collapse facets when collapseFacetsAfter is set to 1', async ({
    facets,
  }) => {
    await facets.load({
      args: {
        collapseFacetsAfter: 1,
      },
    });
    await expect(facets.expandedFacets).toHaveCount(1);
    await expect(facets.collapsedFacets).toHaveCount(8);
  });

  test('should disable collapse facets when collapseFacetsAfter is set to -1', async ({
    facets,
  }) => {
    await facets.load({
      args: {
        collapseFacetsAfter: -1,
      },
    });
    await expect(facets.collapsedFacets).toHaveCount(0);
    await expect(facets.expandedFacets).toHaveCount(9);
  });
});

test.describe('loading state', async () => {
  test('should display placeholder equal to the collapse facet after property', async ({
    facets,
  }) => {
    await facets.load({args: {collapseFacetsAfter: 5}, story: 'loading-state'});
    await expect(facets.placeholders).toHaveCount(5);
  });
});
