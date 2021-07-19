import {BaseRangeFacetRequest} from '../../generic/interfaces/request';
import {CurrentValues, Type} from '../../../facet-api/request';
import {FacetValueState} from '../../../facet-api/value';

export interface DateRangeApiRequest {
  start: string;
  end: string;
  endInclusive: boolean;
  state: FacetValueState;
}

export interface DateFacetRequest
  extends BaseRangeFacetRequest,
    CurrentValues<DateRangeApiRequest>,
    Type<'dateRange'> {}
