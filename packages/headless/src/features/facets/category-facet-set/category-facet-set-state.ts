import {CategoryFacetRequest} from './interfaces/request';

export type CategoryFacetSetState = Record<string, CategoryFacetRequest>;

export function getCategoryFacetSetInitialState(): CategoryFacetSetState {
  return {};
}
