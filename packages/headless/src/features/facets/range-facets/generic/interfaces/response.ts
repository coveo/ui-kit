import {BaseFacetValue} from '../../../facet-api/response.js';

export interface RangeValue<T extends string | number> extends BaseFacetValue {
  start: T;
  end: T;
  endInclusive: boolean;
}
