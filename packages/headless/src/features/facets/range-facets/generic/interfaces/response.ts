import {BaseFacetValue} from '../../../facet-api/response';

export interface RangeValue<T extends string | number> extends BaseFacetValue {
  start: T;
  end: T;
  endInclusive: boolean;
}
