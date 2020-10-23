import {DateFacetRequest} from './interfaces/request';

export type DateFacetSetState = Record<string, DateFacetRequest>;

export function getDateFacetSetInitialState(): DateFacetSetState {
  return {};
}
