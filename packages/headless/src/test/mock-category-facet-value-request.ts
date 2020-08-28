import {CategoryFacetValueRequest} from '../features/facets/category-facet-set/interfaces/request';

export function buildMockCategoryFacetValueRequest(
  config: Partial<CategoryFacetValueRequest> = {}
): CategoryFacetValueRequest {
  return {
    value: '',
    state: 'idle',
    children: [],
    retrieveChildren: false,
    retrieveCount: 0,
    ...config,
  };
}
