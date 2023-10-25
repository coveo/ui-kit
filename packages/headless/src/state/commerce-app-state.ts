import {
  CommercePaginationSection,
  CartSection,
  CommerceContextSection,
  ConfigurationSection,
  ProductListingV2Section,
  VersionSection,
  CommerceSortSection,
  CommerceFacetSection,
} from './state-sections';

export type CommerceAppState = ConfigurationSection &
  ProductListingV2Section &
  CommerceFacetSection &
  CommercePaginationSection &
  CommerceSortSection &
  CommerceContextSection &
  CartSection &
  VersionSection;
