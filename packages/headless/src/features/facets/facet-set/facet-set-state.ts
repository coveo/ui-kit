import {FacetRequest} from './interfaces/request';

export type FacetSetState = Record<string, FacetRequest>;

export function getFacetSetInitialState(): FacetSetState {
  return {};
}
