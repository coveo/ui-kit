import {FacetValue} from '../features/facets/facet-set/interfaces/response';

export function buildMockFacetValue(
  config: Partial<FacetValue> = {}
): FacetValue {
  return {
    value: 'something',
    state: 'idle',
    numberOfResults: 0,
    ...config,
  };
}
