import {NumericFacetResponse} from '../features/facets/range-facets/numeric-facet-set/interfaces/response';

export function buildMockNumericFacetResponse(
  config: Partial<NumericFacetResponse> = {}
): NumericFacetResponse {
  return {
    facetId: '',
    field: '',
    indexScore: 0,
    moreValuesAvailable: false,
    values: [],
    ...config,
  };
}
