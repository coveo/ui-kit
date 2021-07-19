import {DateFacetApiValue} from '../features/facets/range-facets/date-facet-set/interfaces/response';

export function buildMockDateFacetValue(
  config: Partial<DateFacetApiValue> = {}
): DateFacetApiValue {
  return {
    start: '0',
    end: '10',
    endInclusive: false,
    numberOfResults: 0,
    state: 'idle',
    ...config,
  };
}
