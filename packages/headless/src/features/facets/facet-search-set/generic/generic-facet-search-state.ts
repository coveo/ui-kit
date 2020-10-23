import {
  CategoryFacetSearchSection,
  CategoryFacetSection,
  ConfigurationSection,
  FacetSearchSection,
  FacetSection,
} from '../../../../state/state-sections';

export type StateNeededForSpecificFacetSearch = ConfigurationSection &
  FacetSearchSection &
  FacetSection;

export type StateNeededForCategoryFacetSearch = ConfigurationSection &
  CategoryFacetSearchSection &
  CategoryFacetSection;

export type StateNeededForFacetSearch = ConfigurationSection &
  Partial<
    StateNeededForSpecificFacetSearch & StateNeededForCategoryFacetSearch
  >;
