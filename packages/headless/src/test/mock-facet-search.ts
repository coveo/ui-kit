import {buildMockFacetSearchResponse} from './mock-facet-search-response';
import {buildMockFacetSearchRequestOptions} from './mock-facet-search-request-options';
import {SpecificFacetSearchState} from '../features/facets/facet-search-set/specific/specific-facet-search-set-slice';

export function buildMockFacetSearch(
  config: Partial<SpecificFacetSearchState> = {}
): SpecificFacetSearchState {
  return {
    options: buildMockFacetSearchRequestOptions(),
    isLoading: false,
    response: buildMockFacetSearchResponse(),
    ...config,
  };
}
