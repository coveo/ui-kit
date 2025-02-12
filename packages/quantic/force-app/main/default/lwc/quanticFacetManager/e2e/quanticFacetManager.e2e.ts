import {testSearch, testInsight, expect} from './fixture';
import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic facet manager ${useCase.label}`, () => {
    test('should load facets in the same order as in the initial search response', async ({
      facetManager,
      search,
    }) => {
      const searchResponsePromise = search.waitForSearchResponse();
      await search.performSearch();

      const searchResponse = await searchResponsePromise;
      const {facets} = await searchResponse.json();
      expect(facets).not.toBeNull();

      const filteredIds = facetManager.filterInputFacets(facets);

      filteredIds.forEach(async (facetId: any, index: number) => {
        const facetManagerItem = facetManager.getFacetManagerItemByIndex(index);
        expect(await facetManagerItem.getAttribute('data-facet-id')).toEqual(
          facetId
        );
      });
    });

    test.describe('when reordering the facets', () => {
      test('should load facets in the reordered order', async ({
        facetManager,
        search,
      }) => {
        await facetManager.mockFacetOrder(
          ['objecttype', 'language', 'date'],
          useCase.value
        );
        const searchResponsePromise = search.waitForSearchResponse();
        await search.performSearch();

        const searchResponse = await searchResponsePromise;
        const searchResponseBody = await searchResponse.json();
        expect(searchResponseBody).not.toBeNull();

        searchResponseBody?.facets?.forEach(
          async (facet: any, index: number) => {
            const facetManagerItem =
              facetManager.getFacetManagerItemByIndex(index);
            expect(
              await facetManagerItem.getAttribute('data-facet-id')
            ).toEqual(facet.facetId);
          }
        );
      });
    });
  });
});
