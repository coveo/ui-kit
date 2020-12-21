import {FacetRequest} from './interfaces/request';

/**
 * A map of specific facet identifer (typically, the facet field) to a facet request
 */
export type FacetSetState = Record<string, FacetRequest>;

export function getFacetSetInitialState(): FacetSetState {
  return {};
}
