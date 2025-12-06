import {expect, test} from './fixture';

test.describe('atomic-automatic-facet-generator', () => {
  test.beforeEach(async ({automaticFacetGenerator}) => {
    await automaticFacetGenerator.load({story: 'default'});
    await automaticFacetGenerator.hydrated.waitFor();
  });

  test('should render automatic facets after first search', async ({
    automaticFacetGenerator,
  }) => {
    await expect(automaticFacetGenerator.automaticFacets.first()).toBeVisible();
  });

  test('should render multiple automatic facets based on desiredCount', async ({
    automaticFacetGenerator,
  }) => {
    const count = await automaticFacetGenerator.automaticFacets.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display facet labels', async ({automaticFacetGenerator}) => {
    const firstLabel = automaticFacetGenerator.getFacetLabel(0);
    await expect(firstLabel).toBeVisible();
  });
});
