import type {DateFacetSlice} from '../features/facets/range-facets/date-facet-set/date-facet-set-state.js';
import {buildMockDateFacetRequest} from './mock-date-facet-request.js';

export function buildMockDateFacetSlice(
  config: Partial<DateFacetSlice> = {}
): DateFacetSlice {
  return {
    request: buildMockDateFacetRequest(),
    ...config,
  };
}
