import {SpecificFacetSearchResponse} from '../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response.js';
import {
  FacetSearchSetState,
  FacetSearchState,
} from '../facet-search-reducer-helpers.js';

export type SpecificFacetSearchState =
  FacetSearchState<SpecificFacetSearchResponse>;
export type SpecificFacetSearchSetState =
  FacetSearchSetState<SpecificFacetSearchResponse>;

export function getFacetSearchSetInitialState(): SpecificFacetSearchSetState {
  return {};
}
