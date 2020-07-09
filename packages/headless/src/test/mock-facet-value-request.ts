import {FacetValueRequest} from '../features/facets/facet-set/facet-set-interfaces';

export function buildMockFacetValueRequest(
  config: Partial<FacetValueRequest> = {}
): FacetValueRequest {
  return {
    value: '',
    state: 'idle',
    ...config,
  };
}
