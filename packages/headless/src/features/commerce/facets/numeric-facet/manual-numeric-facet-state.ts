import {NumericRangeRequest} from '../../../facets/range-facets/numeric-facet-set/interfaces/request';

export interface ManualNumericFacetSetSlice {
  manualRange: NumericRangeRequest | undefined;
}

export type ManualNumericFacetSetState = Record<
  string,
  ManualNumericFacetSetSlice
>;

export function getManualNumericFacetInitialState(): ManualNumericFacetSetState {
  return {};
}
