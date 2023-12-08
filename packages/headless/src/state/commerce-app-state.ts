import {
  CommercePaginationSection,
  CartSection,
  CommerceContextSection,
  ConfigurationSection,
  ProductListingV2Section,
  VersionSection,
  CommerceSortSection,
  CommerceSearchSection,
  CommerceQuerySection,
  CommerceFacetSetSection,
  FacetOrderSection,
  QuerySuggestionSection,
  QuerySetSection,
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
  QuerySuggestionSection &
  QuerySetSection &
  VersionSection;
