import type {AnyFacetRequest} from '../features/commerce/facets/facet-set/interfaces/request.js';

export function buildMockCommerceFacetRequest(
  config: Partial<AnyFacetRequest> = {}
): AnyFacetRequest {
  return {
    facetId: '',
    displayName: '',
    field: '',
    type: 'regular',
    numberOfValues: 8,
    values: [],
    isFieldExpanded: false,
    preventAutoSelect: false,
    initialNumberOfValues: 0,
    freezeCurrentValues: false,
    ...config,
  };
}
