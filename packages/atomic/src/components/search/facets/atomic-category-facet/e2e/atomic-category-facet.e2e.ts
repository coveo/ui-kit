import {test, expect} from './fixture';

test.describe('when clicking facet search "More matches for"', () => {
  test.beforeEach(async ({facet}) => {
    await facet.load({story: 'low-facet-values'});
  });
  test('should display an increasing number of matches', async ({facet}) => {
    await facet.getFacetSearch.click();
    await facet.getFacetSearch.pressSequentially('p');
    await expect
      .poll(async () => {
        return await facet.getFacetValue.count();
      })
      .toBeGreaterThanOrEqual(2);

    await facet.facetSearchMoreMatchesFor.click();
    await expect
      .poll(async () => {
        return await facet.getFacetValue.count();
      })
      .toBeGreaterThanOrEqual(4);

    await facet.facetSearchMoreMatchesFor.click();
    await expect
      .poll(async () => {
        return await facet.getFacetValue.count();
      })
      .toBeGreaterThanOrEqual(6);
  });
});
