import {
  FacetSearchSetState,
  FacetSearchState,
} from '../facet-search-reducer-helpers.js';
import {
  LocationFacetSearchResponse
} from '../../../../api/search/facet-search/location-facet-search/location-facet-search-response.js';

export type LocationFacetSearchState =
  FacetSearchState<LocationFacetSearchResponse>;
export type LocationFacetSearchSetState =
  FacetSearchSetState<LocationFacetSearchResponse>;

export function getLocationFacetSearchSetInitialState(): LocationFacetSearchSetState {
  return {};
}
