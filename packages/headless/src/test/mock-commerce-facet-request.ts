import {AnyCommerceFacetRequest} from '../features/commerce/facets/facet-set/interfaces/request';

export function buildMockCommerceFacetRequest(
  config: Partial<AnyCommerceFacetRequest> = {}
): AnyCommerceFacetRequest {
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
    ...config,
  };
}
