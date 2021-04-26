import {FacetSearchRequestOptions} from '../api/search/facet-search/base/base-facet-search-request';
import {defaultFacetSearchOptions} from '../features/facets/facet-search-set/facet-search-reducer-helpers';

export function buildMockFacetSearchRequestOptions(
  config: Partial<FacetSearchRequestOptions> = {}
): FacetSearchRequestOptions {
  return {
    ...defaultFacetSearchOptions,
    ...config,
  };
}
