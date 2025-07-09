import type {FacetRequest} from '../features/facets/facet-set/interfaces/request.js';

export function buildMockFacetRequest(
  config: Partial<FacetRequest> = {}
): FacetRequest {
  return {
    facetId: '',
    field: '',
    currentValues: [],
    customSort: [],
    filterFacetCount: false,
    freezeCurrentValues: false,
    injectionDepth: 1000,
    isFieldExpanded: false,
    numberOfValues: 8,
    preventAutoSelect: false,
    sortCriteria: 'score',
    resultsMustMatch: 'atLeastOneValue',
    type: 'specific',
    ...config,
  };
}
