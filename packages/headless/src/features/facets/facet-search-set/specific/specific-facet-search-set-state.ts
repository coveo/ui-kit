import {SpecificFacetSearchResponse} from '../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {
  FacetSearchSetState,
  FacetSearchState,
} from '../facet-search-reducer-helpers';

export type SpecificFacetSearchState = FacetSearchState<
  SpecificFacetSearchResponse
>;
export type SpecificFacetSearchSetState = FacetSearchSetState<
  SpecificFacetSearchResponse
>;

export function getFacetSearchSetInitialState(): SpecificFacetSearchSetState {
  return {};
}
