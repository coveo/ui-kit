import type {DateFacetRequest} from './interfaces/request.js';

export type DateFacetSlice = {
  request: DateFacetRequest;
};

export type DateFacetSetState = Record<string, DateFacetSlice>;

export function getDateFacetSetSliceInitialState(
  request: DateFacetRequest
): DateFacetSlice {
  return {request};
}

export function getDateFacetSetInitialState(): DateFacetSetState {
  return {};
}
