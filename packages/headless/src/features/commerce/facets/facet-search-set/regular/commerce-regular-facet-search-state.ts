import {FacetSearchSection} from '../../../../../state/state-sections.js';
import {CoreStateNeededForFacetSearch} from '../commerce-facet-search-state.js';

export type StateNeededForRegularFacetSearch = CoreStateNeededForFacetSearch &
  FacetSearchSection;
