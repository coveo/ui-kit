import {CategoryFacetSearchResponse} from '../../../../api/search/facet-search/category-facet-search/category-facet-search-response';
import {
  FacetSearchSetState,
  FacetSearchState,
} from '../facet-search-reducer-helpers';

export type CategoryFacetSearchState = FacetSearchState<
  CategoryFacetSearchResponse
>;

export type CategoryFacetSearchSetState = FacetSearchSetState<
  CategoryFacetSearchResponse
>;

export function getCategoryFacetSearchSetInitialState(): CategoryFacetSearchSetState {
  return {};
}
