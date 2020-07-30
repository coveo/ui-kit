import {
  DateFacetRequest,
  DateRangeRequest,
} from '../../date-facet-set/interfaces/request';
import {
  NumericFacetRequest,
  NumericRangeRequest,
} from '../../numeric-facet-set/interfaces/request';
import {DateFacetRegistrationOptions} from '../../date-facet-set/interfaces/options';
import {NumericFacetRegistrationOptions} from '../../numeric-facet-set/interfaces/options';
import {
  DateFacetValue,
  DateFacetResponse,
} from '../../date-facet-set/interfaces/response';
import {
  NumericFacetValue,
  NumericFacetResponse,
} from '../../numeric-facet-set/interfaces/response';

export type RangeFacetRequest = DateFacetRequest | NumericFacetRequest;
export type RangeValueRequest = DateRangeRequest | NumericRangeRequest;
export type RangeFacetRegistrationOptions =
  | DateFacetRegistrationOptions
  | NumericFacetRegistrationOptions;
export type RangeFacetValue = DateFacetValue | NumericFacetValue;
export type RangeFacetResponse = DateFacetResponse | NumericFacetResponse;
