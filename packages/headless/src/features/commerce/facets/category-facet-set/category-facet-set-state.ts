import {CommerceCategoryFacetRequest} from './interfaces/request';

export type CommerceCategoryFacetSlice = {
  request: CommerceCategoryFacetRequest;
  initialNumberOfValues: number;
};

export type CommerceCategoryFacetSetState = Record<
  string,
  CommerceCategoryFacetSlice
>;

export function getCommerceCategoryFacetSetInitialState(): CommerceCategoryFacetSetState {
  return {};
}
