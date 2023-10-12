import {
  CommercePaginationSection,
  CartSection,
  CommerceContextSection,
  ConfigurationSection,
  ProductListingV2Section,
  VersionSection,
} from './state-sections.js';

export type CommerceAppState = ConfigurationSection &
  ProductListingV2Section &
  CommercePaginationSection &
  CommerceContextSection &
  CartSection &
  VersionSection;
