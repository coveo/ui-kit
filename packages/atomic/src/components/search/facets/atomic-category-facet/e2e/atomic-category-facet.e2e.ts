import {expect, test} from './fixture';

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

//TODO KIT-4944: Replace by Unit tests
[
  {
    name: 'With custom all categories label, using facetId',
    story: 'with-custom-all-categories-label-by-id',
  },
  {
    name: 'With custom all categories label, using field',
    story: 'with-custom-all-categories-label-by-field',
  },
  {
    name: 'With custom all categories label, using facetId and field competing',
    story: 'with-custom-all-categories-label-with-id-and-field-competing',
  },
].forEach(({name, story}) => {
  test.describe(name, () => {
    test.beforeEach(async ({facet}) => {
      await facet.load({story});
    });

    test('should display the custom all categories label after selecting a facet value with children values', async ({
      facet,
    }) => {
      await facet.getFacetValueByLabel('North America').click();
      await expect(facet.getAllCategoriesButton).toHaveText('My Awesome Facet');
    });

    test('should display the custom all categories label for path when searching for root values', async ({
      facet,
    }) => {
      await facet.getFacetSearch.fill('North America');
      await expect(facet.getFacetValue).toHaveText(/My Awesome Facet/);
    });
  });
});
