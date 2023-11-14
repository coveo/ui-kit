import {CommerceFacetRequest} from '../features/commerce/facets/facet-set/interfaces/request';

export function buildMockCommerceFacetRequest(
  config: Partial<CommerceFacetRequest> = {}
): CommerceFacetRequest {
  return {
    field: '',
    type: 'regular',
    numberOfValues: 8,
    values: [],
    ...config,
  };
}
