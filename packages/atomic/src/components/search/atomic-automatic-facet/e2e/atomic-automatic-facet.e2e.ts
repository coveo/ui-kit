import {expect, test} from './fixture';

test.describe('atomic-automatic-facet', () => {
  test.beforeEach(async ({automaticFacet}) => {
    await automaticFacet.load({story: 'default'});
    await automaticFacet.hydrated.waitFor();
  });

  test('should render the automatic facet with label', async ({
    automaticFacet,
  }) => {
    await expect(automaticFacet.facetLabel).toBeVisible();
    await expect(automaticFacet.facetLabel).toContainText('Type');
  });

  test('should display facet values', async ({automaticFacet}) => {
    await expect(automaticFacet.facetValues).toHaveCount(4);
  });
});
