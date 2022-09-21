import {FacetRequest} from '../features/facets/facet-set/interfaces/request';

export function buildMockFacetRequest(
  config: Partial<FacetRequest> = {}
): FacetRequest {
  return {
    facetId: '',
    field: '',
    currentValues: [],
    filterFacetCount: false,
    freezeCurrentValues: false,
    injectionDepth: 1000,
    isFieldExpanded: false,
    numberOfValues: 8,
    preventAutoSelect: false,
    sortCriteria: 'score',
    type: 'specific',
    hasBreadcrumbs: true,
    ...config,
  };
}
