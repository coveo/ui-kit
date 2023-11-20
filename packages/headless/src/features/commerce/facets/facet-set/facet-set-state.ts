import {CommerceFacetRequest} from './interfaces/request';

export type CommerceFacetSlice = {
  request: CommerceFacetRequest;
};

/**
 * An object in which each key is a facet identifier, and each value is the corresponding facet request.
 */
export type CommerceFacetSetState = Record<string, CommerceFacetSlice>;

export function getCommerceFacetSetInitialState(): CommerceFacetSetState {
  return {};
}
