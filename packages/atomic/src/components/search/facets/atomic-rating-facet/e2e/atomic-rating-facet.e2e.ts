import {expect, test} from './fixture';

test.describe('with facet values as link', () => {
  test.beforeEach(async ({facet}) => {
    await facet.load({story: 'display-as-link'});
  });

  test.describe('when no value is selected', () => {
    test('should not dim any facet values', async ({facet}) => {
      const facetValues = await facet.facetValues.all();
      for (let i = 0; i < facetValues.length; i++) {
        await expect(facetValues[i]).toHaveCSS('opacity', '1');
      }
    });
  });

  test.describe('when selecting a value', () => {
    test.beforeEach(async ({facet}) => {
      await facet.getFacetValueButtonByPosition(0).click();
    });

    test('should dim unselected facet values', async ({facet}) => {
      const facetValues = await facet.facetValues.all();
      for (let i = 1; i < facetValues.length; i++) {
        await expect(facetValues[i]).toHaveCSS('opacity', '0.8');
      }
    });

    test('should not dim selected facet', async ({facet}) => {
      await expect(facet.facetValues.nth(0)).toHaveCSS('opacity', '1');
    });
  });
});
