import type {FacetSearchSection} from '../../../../../state/state-sections.js';
import type {CoreStateNeededForFacetSearch} from '../commerce-facet-search-state.js';

export type StateNeededForRegularFacetSearch = CoreStateNeededForFacetSearch &
  FacetSearchSection;
