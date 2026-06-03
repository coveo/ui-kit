import type {DateFacetRequest} from './interfaces/request.js';

export type DateFacetSlice = {
  request: DateFacetRequest;
  tabs?: {included?: string[]; excluded?: string[]};
};

export type DateFacetSetState = Record<string, DateFacetSlice>;

export function getDateFacetSetSliceInitialState(
  request: DateFacetRequest,
  tabs?: {included?: string[]; excluded?: string[]}
): DateFacetSlice {
  return {request, tabs};
}

export function getDateFacetSetInitialState(): DateFacetSetState {
  return {};
}
