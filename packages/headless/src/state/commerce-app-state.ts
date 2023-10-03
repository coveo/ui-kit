import {
  CartSection,
  CategoryFacetSection, CommerceContextSection,
  ConfigurationSection,
  DateFacetSection,
  FacetOrderSection,
  FacetSection,
  NumericFacetSection,
  PaginationSection,
  ProductListingV2Section,
  VersionSection,
} from './state-sections';

export type CommerceAppState = ConfigurationSection &
  ProductListingV2Section &
  CommerceContextSection &
  CartSection &
  FacetSection &
  NumericFacetSection &
  CategoryFacetSection &
  DateFacetSection &
  FacetOrderSection &
  PaginationSection &
  VersionSection;
