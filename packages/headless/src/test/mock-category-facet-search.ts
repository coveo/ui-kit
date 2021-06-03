import {CategoryFacetSearchState} from '../features/facets/facet-search-set/category/category-facet-search-set-state';
import {buildMockCategoryFacetSearchResponse} from './mock-category-facet-search-response';
import {buildMockFacetSearchRequestOptions} from './mock-facet-search-request-options';

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
