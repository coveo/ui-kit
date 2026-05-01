import type {NumericFacetRequest} from './interfaces/request.js';

export type NumericFacetSlice = {
  request: NumericFacetRequest;
  tabs?: {included?: string[]; excluded?: string[]};
};

export type NumericFacetSetState = Record<string, NumericFacetSlice>;

export function getNumericFacetSetSliceInitialState(
  request: NumericFacetRequest,
  tabs?: {included?: string[]; excluded?: string[]}
): NumericFacetSlice {
  return {request, tabs};
}

export function getNumericFacetSetInitialState(): NumericFacetSetState {
  return {};
}
