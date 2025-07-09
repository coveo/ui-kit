import type {CategoryFacetSearchResponse} from '../api/search/facet-search/category-facet-search/category-facet-search-response.js';

export function buildMockCategoryFacetSearchResponse(
  config: Partial<CategoryFacetSearchResponse> = {}
): CategoryFacetSearchResponse {
  return {
    moreValuesAvailable: false,
    values: [],
    ...config,
  };
}
