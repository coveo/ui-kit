import {
  CategoryFacetSection,
  ConfigurationSection,
  DateFacetSection,
  FacetOptionsSection,
  FacetOrderSection,
  FacetSection,
  NumericFacetSection,
  PaginationSection,
  ProductListingSection,
  StructuredSortSection,
  VersionSection,
} from './state-sections';

export type ProductListingAppState = ConfigurationSection &
  ProductListingSection &
  FacetSection &
  NumericFacetSection &
  CategoryFacetSection &
  DateFacetSection &
  FacetOptionsSection &
  FacetOrderSection &
  StructuredSortSection &
  PaginationSection &
  VersionSection;
