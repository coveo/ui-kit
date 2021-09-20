import {
  CategoryFacetSearchSection,
  CategoryFacetSection,
  ConfigurationSection,
  DateFacetSection,
  FacetOptionsSection,
  FacetOrderSection,
  FacetSearchSection,
  FacetSection,
  NumericFacetSection,
  PaginationSection,
  ProductListingSection,
  StructuredSortSection,
  VersionSection,
} from './state-sections';

export type ProductListingAppState = ConfigurationSection &
  ProductListingSection &
  FacetSearchSection &
  FacetSection &
  NumericFacetSection &
  CategoryFacetSection &
  CategoryFacetSearchSection &
  DateFacetSection &
  FacetOptionsSection &
  FacetOrderSection &
  StructuredSortSection &
  PaginationSection &
  VersionSection;
