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
});

test.describe('loading state', async () => {
  test('should display placeholder equal to the collapse facet after property', async ({
    facets,
  }) => {
    await facets.load({args: {collapseFacetsAfter: 5}, story: 'loading-state'});
    await expect(facets.placeholders).toHaveCount(5);
  });
});
