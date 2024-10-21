import {LocationFacetSearchResponse} from '../../../../api/commerce/facet-search/location-facet-search/location-facet-search-response.js';
import {
  FacetSearchSetState,
  FacetSearchState,
} from '../facet-search-reducer-helpers.js';

export type LocationFacetSearchState =
  FacetSearchState<LocationFacetSearchResponse>;
export type LocationFacetSearchSetState =
  FacetSearchSetState<LocationFacetSearchResponse>;

export function getLocationFacetSearchSetInitialState(): LocationFacetSearchSetState {
  return {};
}
