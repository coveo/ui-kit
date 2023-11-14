import {CommerceFacetRequest} from './interfaces/request';

export type CommerceFacetSlice = {
  request: CommerceFacetRequest;
};

/**
 * A map of specific facet identifier (typically, the facet field) to a facet request
 */
export type CommerceFacetSetState = Record<string, CommerceFacetSlice>;

export function getCommerceFacetSetInitialState(): CommerceFacetSetState {
  return {};
}
