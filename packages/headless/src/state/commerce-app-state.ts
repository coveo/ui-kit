import {
  CategoryFacetSection,
  ConfigurationSection,
  ContextSection,
  DateFacetSection,
  FacetOptionsSection,
  FacetOrderSection,
  FacetSection,
  NumericFacetSection,
  PaginationSection,
  ProductListingV2Section,
  StructuredSortSection,
  VersionSection,
} from './state-sections';

export type ProductListingV2AppState = ConfigurationSection &
  ProductListingV2Section &
  FacetSection &
  NumericFacetSection &
  CategoryFacetSection &
  DateFacetSection &
  FacetOptionsSection &
  FacetOrderSection &
  StructuredSortSection &
  PaginationSection &
  VersionSection &
  ContextSection;
