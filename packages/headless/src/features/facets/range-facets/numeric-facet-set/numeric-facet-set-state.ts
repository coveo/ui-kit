import {NumericFacetRequest} from './interfaces/request';

export type NumericFacetSetState = Record<string, NumericFacetRequest>;

export function getNumericFacetSetInitialState(): NumericFacetSetState {
  return {};
}
