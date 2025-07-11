import type {AutomaticFacetResponse} from '../features/facets/automatic-facet-set/interfaces/response.js';

export function buildMockAutomaticFacetResponse(
  config: Partial<AutomaticFacetResponse> = {}
): AutomaticFacetResponse {
  return {
    field: 'field',
    moreValuesAvailable: false,
    label: '',
    values: [],
    indexScore: 0.1,
    ...config,
  };
}
