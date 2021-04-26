import {buildMockFacetSearchResponse} from './mock-facet-search-response';
import {SpecificFacetSearchState} from '../features/facets/facet-search-set/specific/specific-facet-search-set-state';
import {buildMockFacetSearchRequestOptions} from './mock-facet-search-request-options';

export function buildMockFacetSearch(
  config: Partial<SpecificFacetSearchState> = {}
): SpecificFacetSearchState {
  return {
    options: buildMockFacetSearchRequestOptions(),
    isLoading: false,
    response: buildMockFacetSearchResponse(),
    initialNumberOfValues: buildMockFacetSearchRequestOptions().numberOfValues,
    ...config,
  };
}
