import {NumericRangeRequest} from '../../../facets/range-facets/numeric-facet-set/interfaces/request';

export interface NumericFacetState {
  manualRange: NumericRangeRequest | null;
}
export function getNumericFacetInitialState(): NumericFacetState {
  return {manualRange: null};
}
