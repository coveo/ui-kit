import {test, expect} from './fixture';

test.describe('default', async () => {
  test('should be A11y compliant', async ({facets, makeAxeBuilder}) => {
    await facets.gotoAndHydrate();
    const accessibilityResults = await makeAxeBuilder().analyze();

    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should display facets', async ({facets}) => {
    await facets.gotoAndHydrate();
    await expect(facets.standardFacets.first()).toBeVisible();
    await expect(facets.numericFacets.first()).toBeVisible();
    await expect(facets.categoryFacets.first()).toBeVisible();
  });

  // KIT-3300
  test.skip('should collapse facets when set to 1', async ({facets}) => {
    await facets.gotoParametrizedAndHydrate({
      collapseFacetsAfter: 1,
    });
    await expect(facets.expandedFacets).toHaveCount(1);
    await expect(facets.collapsedFacets).toHaveCount(3);
  });

  // KIT-3300
  test.skip('should disable collapse facets when set to -1', async ({
    facets,
  }) => {
    await facets.gotoParametrizedAndHydrate({
      collapseFacetsAfter: -1,
    });
    await expect(facets.collapsedFacets).toHaveCount(0);
    await expect(facets.expandedFacets).toHaveCount(4);
  });
});
