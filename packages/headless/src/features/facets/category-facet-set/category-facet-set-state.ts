import type {CategoryFacetRequest} from './interfaces/request.js';

export type CategoryFacetSlice = {
  request: CategoryFacetRequest;
  initialNumberOfValues: number;
};

export type CategoryFacetSetState = Record<string, CategoryFacetSlice>;

export function getCategoryFacetSetInitialState(): CategoryFacetSetState {
  return {};
}
