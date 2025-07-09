import type {FacetSearchRequestOptions} from '../api/search/facet-search/base/base-facet-search-request.js';

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
