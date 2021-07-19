import {BaseFacetResponse} from '../../../facet-api/response';
import {FacetValueState} from '../../../facet-api/value';

export interface DateFacetApiValue {
  numberOfResults: number;
  start: string;
  end: string;
  endInclusive: boolean;
  state: FacetValueState;
}

export type DateFacetResponse = BaseFacetResponse<DateFacetApiValue>;
