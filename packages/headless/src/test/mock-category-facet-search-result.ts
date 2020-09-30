import {CategoryFacetSearchResult} from '../api/search/facet-search/category-facet-search/category-facet-search-response';

export function buildMockCategoryFacetSearchResult(
  config: Partial<CategoryFacetSearchResult> = {}
): CategoryFacetSearchResult {
  return {
    rawValue: '',
    displayValue: '',
    path: [],
    count: 1,
    ...config,
  };
}
