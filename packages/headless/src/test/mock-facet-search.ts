import type {SpecificFacetSearchState} from '../features/facets/facet-search-set/specific/specific-facet-search-set-state.js';
import {buildMockFacetSearchRequestOptions} from './mock-facet-search-request-options.js';
import {buildMockFacetSearchResponse} from './mock-facet-search-response.js';

export function buildMockFacetSearch(
  config: Partial<SpecificFacetSearchState> = {}
): SpecificFacetSearchState {
  return {
    options: buildMockFacetSearchRequestOptions(),
    isLoading: false,
    response: buildMockFacetSearchResponse(),
    initialNumberOfValues: 0,
    requestId: '',
    ...config,
  };
}
