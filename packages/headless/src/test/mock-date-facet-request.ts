import type {DateFacetRequest} from '../features/facets/range-facets/date-facet-set/interfaces/request.js';

export function buildMockDateFacetRequest(
  config: Partial<DateFacetRequest> = {}
): DateFacetRequest {
  return {
    facetId: '',
    field: '',
    currentValues: [],
    filterFacetCount: false,
    generateAutomaticRanges: false,
    injectionDepth: 1000,
    numberOfValues: 8,
    preventAutoSelect: false,
    sortCriteria: 'ascending',
    resultsMustMatch: 'atLeastOneValue',
    type: 'dateRange',
    rangeAlgorithm: 'even',
    ...config,
  };
}
