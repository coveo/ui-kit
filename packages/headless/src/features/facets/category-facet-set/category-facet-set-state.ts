import type {CategoryFacetRequest} from './interfaces/request.js';

export type CategoryFacetSlice = {
  request: CategoryFacetRequest;
  initialNumberOfValues: number;
  tabs?: {included?: string[]; excluded?: string[]};
};

export type CategoryFacetSetState = Record<string, CategoryFacetSlice>;

export function getCategoryFacetSetInitialState(): CategoryFacetSetState {
  return {};
}
