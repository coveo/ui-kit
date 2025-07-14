import type {CategoryFacetResponse} from '../features/facets/category-facet-set/interfaces/response.js';

export function buildMockCategoryFacetResponse(
  config: Partial<CategoryFacetResponse> = {}
): CategoryFacetResponse {
  return {
    facetId: '',
    field: '',
    indexScore: 0,
    moreValuesAvailable: false,
    values: [],
    ...config,
  };
}
