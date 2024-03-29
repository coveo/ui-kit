import {RegisterDateFacetActionCreatorPayload} from '../../date-facet-set/date-facet-actions';
import {DateFacetSetState} from '../../date-facet-set/date-facet-set-state';
import {
  DateFacetRequest,
  DateRangeRequest,
} from '../../date-facet-set/interfaces/request';
import {
  DateFacetValue,
  DateFacetResponse,
} from '../../date-facet-set/interfaces/response';
import {
  NumericFacetRequest,
  NumericRangeRequest,
} from '../../numeric-facet-set/interfaces/request';
import {
  NumericFacetValue,
  NumericFacetResponse,
} from '../../numeric-facet-set/interfaces/response';
import {RegisterNumericFacetActionCreatorPayload} from '../../numeric-facet-set/numeric-facet-actions';
import {NumericFacetSetState} from '../../numeric-facet-set/numeric-facet-set-state';

export type RangeFacetRequest = DateFacetRequest | NumericFacetRequest;
export type RangeValueRequest = DateRangeRequest | NumericRangeRequest;
export type RangeFacetSetState = DateFacetSetState | NumericFacetSetState;
export type RangeFacetRegistrationOptions =
  | RegisterDateFacetActionCreatorPayload
  | RegisterNumericFacetActionCreatorPayload;
export type RangeFacetValue = DateFacetValue | NumericFacetValue;
export type RangeFacetResponse = DateFacetResponse | NumericFacetResponse;
