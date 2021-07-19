import {
  DateFacetRequest,
  DateRangeApiRequest,
} from '../../date-facet-set/interfaces/request';
import {
  NumericFacetRequest,
  NumericRangeRequest,
} from '../../numeric-facet-set/interfaces/request';
import {
  DateFacetValue,
  DateFacetResponse,
} from '../../date-facet-set/interfaces/response';
import {
  NumericFacetValue,
  NumericFacetResponse,
} from '../../numeric-facet-set/interfaces/response';
import {RegisterDateFacetActionCreatorPayload} from '../../date-facet-set/date-facet-actions';
import {RegisterNumericFacetActionCreatorPayload} from '../../numeric-facet-set/numeric-facet-actions';

export type RangeFacetRequest = DateFacetRequest | NumericFacetRequest;
export type RangeValueRequest = DateRangeApiRequest | NumericRangeRequest;
export type RangeFacetRegistrationOptions =
  | RegisterDateFacetActionCreatorPayload
  | RegisterNumericFacetActionCreatorPayload;
export type RangeFacetValue = DateFacetValue | NumericFacetValue;
export type RangeFacetResponse = DateFacetResponse | NumericFacetResponse;
