import {FacetValue} from '../features/facets/facet-set/facet-set-interfaces';

export function buildMockFacetValue(
  config: Partial<FacetValue> = {}
): FacetValue {
  return {
    value: '',
    state: 'idle',
    numberOfResults: 0,
    ...config,
  };
}
