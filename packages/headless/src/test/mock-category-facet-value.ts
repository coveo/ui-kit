import type {CategoryFacetValue} from '../features/facets/category-facet-set/interfaces/response.js';

export function buildMockCategoryFacetValue(
  config: Partial<CategoryFacetValue> = {}
): CategoryFacetValue {
  return {
    children: [],
    numberOfResults: 0,
    path: [],
    state: 'idle',
    value: '',
    moreValuesAvailable: false,
    isLeafValue: false,
    ...config,
  };
}
