import {FacetSearchSection} from '../../../../../state/state-sections';
import {CoreStateNeededForFacetSearch} from '../commerce-facet-search-state';

export type StateNeededForRegularFacetSearch = CoreStateNeededForFacetSearch &
  FacetSearchSection;
