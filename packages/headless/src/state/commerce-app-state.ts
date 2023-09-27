import {
  ConfigurationSection,
  ProductListingV2Section,
  VersionSection,
} from './state-sections';

export type CommerceAppState = ConfigurationSection &
  ProductListingV2Section &
  VersionSection;
