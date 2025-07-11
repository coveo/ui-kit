import type {FacetValueRequest} from '../features/facets/facet-set/interfaces/request.js';

export function buildMockFacetValueRequest(
  config: Partial<FacetValueRequest> = {}
): FacetValueRequest {
  return {
    value: '',
    state: 'idle',
    ...config,
  };
}
