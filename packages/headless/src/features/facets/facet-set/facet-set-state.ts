import type {FacetRequest} from './interfaces/request.js';

export type FacetSlice = {
  request: FacetRequest;
  hasBreadcrumbs: boolean;
  tabs?: {included?: string[]; excluded?: string[]};
};

/**
 * A map of specific facet identifier (typically, the facet field) to a facet request
 */
export type FacetSetState = Record<string, FacetSlice>;

export function getFacetSetSliceInitialState(
  request: FacetRequest,
  tabs?: {included?: string[]; excluded?: string[]}
): FacetSlice {
  return {request, hasBreadcrumbs: true, tabs};
}

export function getFacetSetInitialState(): FacetSetState {
  return {};
}
