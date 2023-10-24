import {
  ConfigurationSection,
  CartSection,
  CategoryFacetSection,
  CommerceContextSection,
  CommercePaginationSection,
  ProductListingV2Section,
  VersionSection,
} from './state-sections';

export type CommerceAppState = ConfigurationSection &
  CartSection &
  CategoryFacetSection &
  CommerceContextSection &
  CommercePaginationSection &
  ProductListingV2Section &
  VersionSection;
