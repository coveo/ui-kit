import {
  RangeRequest,
  BaseRangeFacetRequest,
} from '../../generic/interfaces/request';
import {CurrentValues, Type} from '../../../facet-api/request';

export type NumericRangeRequest = RangeRequest<number>;

export interface NumericFacetRequest
  extends BaseRangeFacetRequest,
    CurrentValues<NumericRangeRequest>,
    Type<'numericalRange'> {}
