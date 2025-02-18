import {testSearch, testInsight, expect} from './fixture';
import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

const exampleFacetsOrder = ['objecttype', 'date', 'language'];

/**
 * Filters out any facetId which contains a filter input "_input" because they are not displayed in the facet manager.
 */
function filterInputFacets(facets: any): string[] {
  return facets
    .map((facet: any) => facet.facetId)
    .filter((id: string) => !/_input$/.test(id));
}

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

      const filteredIds = filterInputFacets(facets);

      filteredIds.forEach(async (facetId: any, index: number) => {
        const facetManagerItem = facetManager.getFacetManagerItemByIndex(index);
        expect(await facetManagerItem.getAttribute('data-facet-id')).toEqual(
          facetId
        );
      });
    });

    test.describe('when the facets are reordered', () => {
      test('should load facets in the reordered order', async ({
        facetManager,
        search,
      }) => {
        await search.mockSearchFacetOrder(exampleFacetsOrder);
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

        [exampleFacetsOrder.length - 1].forEach(async (index: number) => {
          const facetManagerItem =
            facetManager.getFacetManagerItemByIndex(index);
          expect(await facetManagerItem.getAttribute('data-facet-id')).toEqual(
            exampleFacetsOrder[index]
          );
        });
      });
    });
  });
});
