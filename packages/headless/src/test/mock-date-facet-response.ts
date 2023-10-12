import {DateFacetResponse} from '../features/facets/range-facets/date-facet-set/interfaces/response.js';

export function buildMockDateFacetResponse(
  config: Partial<DateFacetResponse> = {}
): DateFacetResponse {
  return {
    facetId: '',
    field: '',
    indexScore: 0,
    moreValuesAvailable: false,
    values: [],
    ...config,
  };
}
