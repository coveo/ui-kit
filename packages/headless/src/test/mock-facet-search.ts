import {SpecificFacetSearchState} from '../features/facets/facet-search-set/specific/specific-facet-search-set-state';
import {buildMockFacetSearchRequestOptions} from './mock-facet-search-request-options';
import {buildMockFacetSearchResponse} from './mock-facet-search-response';

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
