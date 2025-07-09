import type {FacetRequest} from './interfaces/request.js';

export type FacetSlice = {
  request: FacetRequest;
  hasBreadcrumbs: boolean;
};

/**
 * A map of specific facet identifier (typically, the facet field) to a facet request
 */
export type FacetSetState = Record<string, FacetSlice>;

export function getFacetSetSliceInitialState(
  request: FacetRequest
): FacetSlice {
  return {request, hasBreadcrumbs: true};
}

export function getFacetSetInitialState(): FacetSetState {
  return {};
}
