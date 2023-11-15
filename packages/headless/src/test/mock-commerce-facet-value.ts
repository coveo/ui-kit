import {FacetValue} from '../features/commerce/facets/facet-set/interfaces/response';

export function buildMockCommerceFacetValue(
  config: Partial<FacetValue> = {}
): FacetValue {
  return {
    value: '',
    facetId: '',
    state: 'idle',
    numberOfResults: 0,
    isAutoSelected: false,
    isSuggested: false,
    moreValuesAvailable: false,
    ...config,
  };
}
