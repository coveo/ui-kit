import type {NumericFacetRequest} from './interfaces/request.js';

export type NumericFacetSlice = {
  request: NumericFacetRequest;
};

export type NumericFacetSetState = Record<string, NumericFacetSlice>;

export function getNumericFacetSetSliceInitialState(
  request: NumericFacetRequest
): NumericFacetSlice {
  return {request};
}

export function getNumericFacetSetInitialState(): NumericFacetSetState {
  return {};
}
