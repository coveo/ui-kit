import {RegisterDateFacetActionCreatorPayload} from '../../date-facet-set/date-facet-actions.js';
import {DateFacetSetState} from '../../date-facet-set/date-facet-set-state.js';
import {
  DateFacetRequest,
  DateRangeRequest,
} from '../../date-facet-set/interfaces/request.js';
import {
  DateFacetValue,
  DateFacetResponse,
} from '../../date-facet-set/interfaces/response.js';
import {
  NumericFacetRequest,
  NumericRangeRequest,
} from '../../numeric-facet-set/interfaces/request.js';
import {
  NumericFacetValue,
  NumericFacetResponse,
} from '../../numeric-facet-set/interfaces/response.js';
import {RegisterNumericFacetActionCreatorPayload} from '../../numeric-facet-set/numeric-facet-actions.js';
import {NumericFacetSetState} from '../../numeric-facet-set/numeric-facet-set-state.js';

export type RangeFacetRequest = DateFacetRequest | NumericFacetRequest;
export type RangeValueRequest = DateRangeRequest | NumericRangeRequest;
export type RangeFacetSetState = DateFacetSetState | NumericFacetSetState;
export type RangeFacetRegistrationOptions =
  | RegisterDateFacetActionCreatorPayload
  | RegisterNumericFacetActionCreatorPayload;
export type RangeFacetValue = DateFacetValue | NumericFacetValue;
export type RangeFacetResponse = DateFacetResponse | NumericFacetResponse;
