import {CategoryFacetRequest} from './interfaces/request';

type CategoryFacetState = {
  request: CategoryFacetRequest;
};

export type CategoryFacetSetState = Record<
  string,
  CategoryFacetState | undefined
>;

export function getCategoryFacetSetInitialState(): CategoryFacetSetState {
  return {};
}
