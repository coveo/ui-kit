import {FacetSearchRequestOptions} from '../features/facets/facet-search-set/facet-search-request-options';

export function buildMockFacetSearchRequestOptions(
  config: Partial<FacetSearchRequestOptions> = {}
): FacetSearchRequestOptions {
  return {
    captions: {},
    numberOfValues: 0,
    query: '',
    ...config,
  };
}
