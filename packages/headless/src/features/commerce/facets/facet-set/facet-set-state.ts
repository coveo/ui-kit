import type {AnyFacetRequest} from './interfaces/request.js';

export type CommerceFacetSlice = {
  request: AnyFacetRequest;
};

/**
 * An object in which each key is a facet identifier, and each value is the corresponding facet request.
 */
export type CommerceFacetSetState = Record<string, CommerceFacetSlice>;

export function getCommerceFacetSetInitialState(): CommerceFacetSetState {
  return {};
}
