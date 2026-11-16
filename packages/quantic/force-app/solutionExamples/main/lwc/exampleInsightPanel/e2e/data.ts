import {searchResponses} from '@coveo/platform-mock-api/insight';
import type {SearchRequestBody} from './pageObject';

type MockFacet = {
  field: string;
  values: Array<{value?: string; state: string}>;
};

type MockResult = {raw: Record<string, unknown>};

/**
 * Builds the Insight search response for a request: the base response from
 * `@coveo/platform-mock-api`, with the facet values selected in the request
 * marked as selected, the way the Insight API reflects them.
 * The results' `sfid` is dropped so result links don't try to resolve fake
 * Salesforce record ids.
 */
export function buildSearchResponse(body: SearchRequestBody) {
  const selectedValuesByField = new Map(
    (body.facets ?? []).map((facet) => [
      facet.field,
      facet.currentValues
        .filter((value) => value.state === 'selected')
        .map((value) => value.value),
    ])
  );
  const baseFacets = searchResponses.baseResponse.facets as MockFacet[];

  const baseResults = searchResponses.baseResponse.results as MockResult[];

  return {
    ...searchResponses.baseResponse,
    results: baseResults.map(({raw: {sfid: _sfid, ...raw}, ...result}) => ({
      ...result,
      raw,
    })),
    facets: baseFacets.map((facet) => {
      const selectedValues = selectedValuesByField.get(facet.field) ?? [];
      return {
        ...facet,
        values: facet.values.map((facetValue) => ({
          ...facetValue,
          state:
            facetValue.value !== undefined &&
            selectedValues.includes(facetValue.value)
              ? 'selected'
              : 'idle',
        })),
      };
    }),
  };
}
