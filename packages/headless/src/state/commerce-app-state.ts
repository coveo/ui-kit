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
  ProductListingV2Section,
  StructuredSortSection,
  VersionSection,
} from './state-sections';

export type ProductListingV2AppState = ConfigurationSection &
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
