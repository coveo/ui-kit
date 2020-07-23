import {BaseFacetResponse, BaseFacetValue} from '../../facet-api/response';

export interface RangeFacetValue extends BaseFacetValue {
  start: string;
  end: string;
  endInclusive: boolean;
}

export type RangeFacetResponse = BaseFacetResponse<RangeFacetValue>;
