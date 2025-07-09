import type {DateFacetResponse} from '../features/facets/range-facets/date-facet-set/interfaces/response.js';

export function buildMockDateFacetResponse(
  config: Partial<DateFacetResponse> = {}
): DateFacetResponse {
  return {
    facetId: '',
    field: '',
    indexScore: 0,
    moreValuesAvailable: false,
    values: [],
    domain: {
      start: '',
      end: '',
    },
    ...config,
  };
}
