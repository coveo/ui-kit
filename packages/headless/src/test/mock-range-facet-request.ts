import {RangeFacetRequest} from '../features/facets/range-facet-set/interfaces/request';

export function buildMockRangeFacetRequest(
  config: Partial<RangeFacetRequest> = {}
): RangeFacetRequest {
  return {
    facetId: '',
    field: '',
    currentValues: [],
    filterFacetCount: false,
    freezeCurrentValues: false,
    generateAutomaticRanges: false,
    injectionDepth: 1000,
    isFieldExpanded: false,
    numberOfValues: 8,
    preventAutoSelect: false,
    sortCriteria: 'ascending',
    type: 'dateRange',
    ...config,
  };
}
