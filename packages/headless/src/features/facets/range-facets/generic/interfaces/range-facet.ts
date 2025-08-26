import type {DateFacetSetState} from '../../date-facet-set/date-facet-set-state.js';
import type {
  DateFacetRequest,
  DateRangeRequest,
} from '../../date-facet-set/interfaces/request.js';
import type {
  DateFacetResponse,
  DateFacetValue,
} from '../../date-facet-set/interfaces/response.js';
import type {
  NumericFacetRequest,
  NumericRangeRequest,
} from '../../numeric-facet-set/interfaces/request.js';
import type {
  NumericFacetResponse,
  NumericFacetValue,
} from '../../numeric-facet-set/interfaces/response.js';
import type {NumericFacetSetState} from '../../numeric-facet-set/numeric-facet-set-state.js';

export type RangeFacetRequest = DateFacetRequest | NumericFacetRequest;
export type RangeValueRequest = DateRangeRequest | NumericRangeRequest;
export type RangeFacetSetState = DateFacetSetState | NumericFacetSetState;
export type RangeFacetValue = DateFacetValue | NumericFacetValue;
export type RangeFacetResponse = DateFacetResponse | NumericFacetResponse;
