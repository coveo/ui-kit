import {buildMockFacetSearchRequestOptions} from './mock-facet-search-request-options';
import {CategoryFacetSearchState} from '../features/facets/facet-search-set/category/category-facet-search-set-slice';
import {buildMockCategoryFacetSearchResponse} from './mock-category-facet-search-response';

export function buildMockCategoryFacetSearch(
  config: Partial<CategoryFacetSearchState> = {}
): CategoryFacetSearchState {
  return {
    options: buildMockFacetSearchRequestOptions(),
    isLoading: false,
    response: buildMockCategoryFacetSearchResponse(),
    ...config,
  };
}
