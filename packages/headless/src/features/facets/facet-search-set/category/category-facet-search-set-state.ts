import type {CategoryFacetSearchResponse} from '../../../../api/search/facet-search/category-facet-search/category-facet-search-response.js';
import type {
  FacetSearchSetState,
  FacetSearchState,
} from '../facet-search-reducer-helpers.js';

export type CategoryFacetSearchState =
  FacetSearchState<CategoryFacetSearchResponse>;

export type CategoryFacetSearchSetState =
  FacetSearchSetState<CategoryFacetSearchResponse>;

export function getCategoryFacetSearchSetInitialState(): CategoryFacetSearchSetState {
  return {};
}
