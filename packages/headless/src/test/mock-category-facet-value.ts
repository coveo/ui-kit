import {CategoryFacetValue} from '../features/facets/category-facet-set/interfaces/response';

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
    ...config,
  };
}
