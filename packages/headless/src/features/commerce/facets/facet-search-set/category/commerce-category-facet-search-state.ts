import {CategoryFacetSearchSection} from '../../../../../state/state-sections.js';
import {CoreStateNeededForFacetSearch} from '../commerce-facet-search-state.js';

export type StateNeededForCategoryFacetSearch = CoreStateNeededForFacetSearch &
  CategoryFacetSearchSection;
