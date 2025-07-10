import type {CategoryFacetSlice} from '../features/facets/category-facet-set/category-facet-set-state.js';
import {buildMockCategoryFacetRequest} from './mock-category-facet-request.js';

export function buildMockCategoryFacetSlice(
  config: Partial<CategoryFacetSlice> = {}
): CategoryFacetSlice {
  return {
    request: buildMockCategoryFacetRequest(),
    initialNumberOfValues: 0,
    ...config,
  };
}
