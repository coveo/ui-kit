import {
  CommercePaginationSection,
  CartSection,
  CommerceContextSection,
  ConfigurationSection,
  ProductListingV2Section,
  VersionSection,
  CommerceSortSection,
  CommerceFacetSection,
  FacetSection,
  FacetOptionsSection,
} from './state-sections';

export type CommerceAppState = ConfigurationSection &
  ProductListingV2Section &
  CommerceFacetSection &
  FacetSection &
  FacetOptionsSection &
  CommercePaginationSection &
  CommerceSortSection &
  CommerceContextSection &
  CartSection &
  VersionSection;
