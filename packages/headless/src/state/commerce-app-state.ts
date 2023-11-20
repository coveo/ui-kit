import {
  CommercePaginationSection,
  CartSection,
  CommerceContextSection,
  ConfigurationSection,
  ProductListingV2Section,
  VersionSection,
  CommerceSortSection,
  NumericFacetSection,
  CommerceSearchSection,
  CommerceQuerySection,
  CommerceFacetSetSection,
  FacetOrderSection,
} from './state-sections';

export type CommerceAppState = ConfigurationSection &
  ProductListingV2Section &
  CommerceSearchSection &
  CommerceQuerySection &
  FacetOrderSection &
  CommerceFacetSetSection &
  CommercePaginationSection &
  CommerceSortSection &
  CommerceContextSection &
  CartSection &
  NumericFacetSection &
  VersionSection;
