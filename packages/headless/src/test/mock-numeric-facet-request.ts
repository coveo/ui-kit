import type {NumericFacetRequest} from '../features/facets/range-facets/numeric-facet-set/interfaces/request.js';

export function buildMockNumericFacetRequest(
  config: Partial<NumericFacetRequest> = {}
): NumericFacetRequest {
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
    type: 'numericalRange',
    rangeAlgorithm: 'even',
    ...config,
  };
}
