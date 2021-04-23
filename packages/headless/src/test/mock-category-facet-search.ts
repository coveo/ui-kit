import {CategoryFacetSearchState} from '../features/facets/facet-search-set/category/category-facet-search-set-state';
import {buildMockCategoryFacetSearchResponse} from './mock-category-facet-search-response';
import {buildMockFacetSearchStateOptions} from './mock-facet-search-state-options';

export function buildMockCategoryFacetSearch(
  config: Partial<CategoryFacetSearchState> = {}
): CategoryFacetSearchState {
  return {
    options: buildMockFacetSearchStateOptions(),
    isLoading: false,
    response: buildMockCategoryFacetSearchResponse(),
    ...config,
  };
}
