import {FacetValueRequest} from '../features/facets/facet-set/interfaces/request';

export function buildMockFacetValueRequest(
  config: Partial<FacetValueRequest> = {}
): FacetValueRequest {
  return {
    value: '',
    state: 'idle',
    ...config,
  };
}
