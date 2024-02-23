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

// eslint-disable-next-line @cspell/spellchecker
// TODO CAPI-546: Handle only the query param for now. Add facets, sort, pagination later.
export type CommerceSearchParametersState = CommerceQuerySection;
export type CommerceProductListingParametersState = {};

export type CommerceRoutableState = ProductListingV2Section &
  CommerceSearchSection &
  CommerceQuerySection &
  FacetOrderSection &
  CommerceFacetSetSection &
  CommercePaginationSection &
  CommerceSortSection &
  CartSection &
  QuerySuggestionSection &
  QuerySetSection;

export type CommerceAppState = ConfigurationSection &
  CommerceContextSection &
  VersionSection;
