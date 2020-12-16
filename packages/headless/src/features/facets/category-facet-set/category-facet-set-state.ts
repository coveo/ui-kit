import {CategoryFacetRequest} from './interfaces/request';

export type CategoryFacetSlice = {
  request: CategoryFacetRequest;
};

export type CategoryFacetSetState = Record<
  string,
  CategoryFacetSlice | undefined
>;

export function getCategoryFacetSetInitialState(): CategoryFacetSetState {
  return {};
}
