import {
  CategoryFacetSearchSection,
  CategoryFacetSection,
  ConfigurationSection,
  ContextSection,
  DateFacetSection,
  FacetOptionsSection,
  FacetOrderSection,
  FacetSearchSection,
  FacetSection,
  NumericFacetSection,
  PaginationSection,
  ProductListingSection, ProductListingV2Section,
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
  VersionSection &
  ContextSection;

// TODO(nico): Complete
export type ProductListingAppStateV2 = ConfigurationSection &
    ProductListingV2Section &
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
    VersionSection &
    ContextSection;
