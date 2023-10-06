import {
  CommercePaginationSection,
  CartSection,
  CommerceContextSection,
  ConfigurationSection,
  ProductListingV2Section,
  VersionSection,
} from './state-sections';

export type CommerceAppState = ConfigurationSection &
  ProductListingV2Section &
  CommercePaginationSection &
  CommerceContextSection &
  CartSection &
  VersionSection;
