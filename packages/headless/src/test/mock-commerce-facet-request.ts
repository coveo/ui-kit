import {CommerceFacetRequest} from '../features/commerce/facets/facet-set/interfaces/request';

export function buildMockCommerceFacetRequest(
  config: Partial<CommerceFacetRequest> = {}
): CommerceFacetRequest {
  return {
    facetId: '',
    field: '',
    type: 'regular',
    numberOfValues: 8,
    values: [],
    isFieldExpanded: false,
    freezeCurrentValues: false,
    preventAutoSelect: false,
    initialNumberOfValues: 0,
    ...config,
  };
}
