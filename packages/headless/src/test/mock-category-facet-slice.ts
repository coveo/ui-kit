import {CategoryFacetSlice} from '../features/facets/category-facet-set/category-facet-set-state';
import {buildMockCategoryFacetRequest} from './mock-category-facet-request';

export function buildMockCategoryFacetSlice(
  config: Partial<CategoryFacetSlice>
): CategoryFacetSlice {
  return {
    request: buildMockCategoryFacetRequest(),
    ...config,
  };
}
