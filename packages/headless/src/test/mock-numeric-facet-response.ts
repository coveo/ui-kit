import type {NumericFacetResponse} from '../features/facets/range-facets/numeric-facet-set/interfaces/response.js';

export function buildMockNumericFacetResponse(
  config: Partial<NumericFacetResponse> = {}
): NumericFacetResponse {
  return {
    facetId: '',
    field: '',
    indexScore: 0,
    moreValuesAvailable: false,
    values: [],
    domain: {
      start: 0,
      end: 0,
    },
    ...config,
  };
}
