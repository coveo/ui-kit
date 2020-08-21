import {FacetSearchState} from '../features/facets/facet-search-set/facet-search-set-slice';
import {buildMockFacetSearchResponse} from './mock-facet-search-response';

export function buildMockFacetSearch(
  config: Partial<FacetSearchState> = {}
): FacetSearchState {
  return {
    options: {
      captions: {},
      numberOfValues: 5,
      query: '',
    },
    isLoading: false,
    response: buildMockFacetSearchResponse(),
    ...config,
  };
}
