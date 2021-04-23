import {buildMockFacetSearchResponse} from './mock-facet-search-response';
import {SpecificFacetSearchState} from '../features/facets/facet-search-set/specific/specific-facet-search-set-state';
import {buildMockFacetSearchStateOptions} from './mock-facet-search-state-options';

export function buildMockFacetSearch(
  config: Partial<SpecificFacetSearchState> = {}
): SpecificFacetSearchState {
  return {
    options: buildMockFacetSearchStateOptions(),
    isLoading: false,
    response: buildMockFacetSearchResponse(),
    ...config,
  };
}
