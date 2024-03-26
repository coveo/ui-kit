import {CategoryFacetSearchSection} from '../../../../../state/state-sections';
import {CoreStateNeededForFacetSearch} from '../commerce-facet-search-state';

export type StateNeededForCategoryFacetSearch = CoreStateNeededForFacetSearch &
  CategoryFacetSearchSection;
