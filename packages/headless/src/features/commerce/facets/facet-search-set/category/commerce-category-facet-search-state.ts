import type {CategoryFacetSearchSection} from '../../../../../state/state-sections.js';
import type {CoreStateNeededForFacetSearch} from '../commerce-facet-search-state.js';

export type StateNeededForCategoryFacetSearch = CoreStateNeededForFacetSearch &
  CategoryFacetSearchSection;
