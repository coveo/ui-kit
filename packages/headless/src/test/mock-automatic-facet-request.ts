import {AutomaticFacetRequest} from '../features/facets/automatic-facet-set/interfaces/request';

export function buildMockAutomaticFacetRequest(
  config: Partial<AutomaticFacetRequest> = {}
): AutomaticFacetRequest {
  return {
    field: 'field',
    label: '',
    currentValues: [],
    ...config,
  };
}
