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
      // Date appears twice because the response has two (ascending and descending input) date facets
      const expectedFacetsFields = ['date', 'date', 'objecttype', 'language'];

      await facetManager.configureFacetOrder(false, useCase.value);
      const searchRequestPromise = search.waitForSearchResponse();
      await search.performSearch();

      const searchRequest = await searchRequestPromise;
      const searchRequestBody = searchRequest.request().postDataJSON();
      expect(searchRequestBody).not.toBeNull();

      const facets = searchRequestBody.facets;
      expect(facets.length).toEqual(expectedFacetsFields.length);

      facets.forEach((facet: any, index: number) => {
        expect(facet.field).toEqual(expectedFacetsFields[index]);
      });
    });

    test.describe('when reordering the facets', () => {
      test('should load facets in the reordered order', async ({
        facetManager,
        search,
      }) => {
        // Date appears twice because the response has two (ascending and descending input) date facets
        const expectedReorderedFacetsFields = [
          'language',
          'objecttype',
          'date',
          'date',
        ];

        await facetManager.configureFacetOrder(true, useCase.value);
        const searchRequestPromise = search.waitForSearchResponse();
        await search.performSearch();

        const searchRequest = await searchRequestPromise;
        const searchRequestBody = searchRequest.request().postDataJSON();
        expect(searchRequestBody).not.toBeNull();

        const facets = searchRequestBody.facets;
        expect(facets.length).toEqual(expectedReorderedFacetsFields.length);

        facets.forEach((facet: any, index: number) => {
          expect(facet.field).toEqual(expectedReorderedFacetsFields[index]);
        });
      });
    });
  });
});
