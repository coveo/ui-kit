import {
  ConfigurationSection,
  CartSection,
  CommerceCategoryFacetSection,
  CommerceContextSection,
  CommercePaginationSection,
  ProductListingV2Section,
  VersionSection,
} from './state-sections';

export type CommerceAppState = ConfigurationSection &
  CartSection &
  CommerceCategoryFacetSection &
  CommerceContextSection &
  CommercePaginationSection &
  ProductListingV2Section &
  VersionSection;
