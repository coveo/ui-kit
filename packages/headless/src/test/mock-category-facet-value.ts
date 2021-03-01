import {CategoryFacetValue} from '../controllers/facets/category-facet/headless-category-facet';

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
