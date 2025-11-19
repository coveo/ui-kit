import {expect, test} from './fixture';

test.describe('atomic-automatic-facet golden path', () => {
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

  test('should allow selecting a facet value', async ({automaticFacet}) => {
    await automaticFacet.firstFacetValue.click();
    await expect(automaticFacet.clearButton).toBeVisible();
  });

  test('should clear selected values when clear button is clicked', async ({
    automaticFacet,
  }) => {
    await automaticFacet.firstFacetValue.click();
    await expect(automaticFacet.clearButton).toBeVisible();

    await automaticFacet.clearButton.click();
    await expect(automaticFacet.clearButton).not.toBeVisible();
  });
});
