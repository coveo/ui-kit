import {
  RangeRequest,
  BaseRangeFacetRequest,
} from '../../generic/interfaces/request';
import {CurrentValues, Type} from '../../../facet-api/request';

export type DateRangeRequest = RangeRequest<string>;

export interface DateFacetRequest
  extends BaseRangeFacetRequest,
    CurrentValues<DateRangeRequest>,
    Type<'dateRange'> {}
