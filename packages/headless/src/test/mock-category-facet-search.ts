import type {CategoryFacetSearchState} from '../features/facets/facet-search-set/category/category-facet-search-set-state.js';
import {buildMockCategoryFacetSearchResponse} from './mock-category-facet-search-response.js';
import {buildMockFacetSearchRequestOptions} from './mock-facet-search-request-options.js';

export function buildMockCategoryFacetSearch(
  config: Partial<CategoryFacetSearchState> = {}
): CategoryFacetSearchState {
  return {
    options: buildMockFacetSearchRequestOptions(),
    isLoading: false,
    response: buildMockCategoryFacetSearchResponse(),
    initialNumberOfValues: buildMockFacetSearchRequestOptions().numberOfValues,
    requestId: '',
    ...config,
  };
}
