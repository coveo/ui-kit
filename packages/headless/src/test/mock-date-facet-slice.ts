import {DateFacetSlice} from '../features/facets/range-facets/date-facet-set/date-facet-set-state';
import {buildMockDateFacetRequest} from './mock-date-facet-request';

export function buildMockDateFacetSlice(
  config: Partial<DateFacetSlice> = {}
): DateFacetSlice {
  return {
    request: buildMockDateFacetRequest(),
    ...config,
  };
}
