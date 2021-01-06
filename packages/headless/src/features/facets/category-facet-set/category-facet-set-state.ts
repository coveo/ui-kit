import {CategoryFacetRequest} from './interfaces/request';

export type CategoryFacetSlice = {
  request: CategoryFacetRequest;
  initialNumberOfValues: number;
};

export type CategoryFacetSetState = Record<
  string,
  CategoryFacetSlice | undefined
>;

export function getCategoryFacetSetInitialState(): CategoryFacetSetState {
  return {};
}
