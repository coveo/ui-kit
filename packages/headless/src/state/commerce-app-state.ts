import {
  CommercePaginationSection,
  CartSection,
  CommerceContextSection,
  ConfigurationSection,
  ProductListingV2Section,
  RecommendationV2Section,
  VersionSection,
  CommerceSortSection,
  CommerceSearchSection,
  CommerceQuerySection,
  CommerceFacetSetSection,
  FacetOrderSection,
  QuerySuggestionSection,
  QuerySetSection,
  FacetSearchSection,
} from './state-sections';

// eslint-disable-next-line @cspell/spellchecker
// TODO CAPI-546: Handle only the query param for now. Add facets, sort, pagination later.
export type CommerceSearchParametersState = CommerceQuerySection;
export type CommerceProductListingParametersState = {};

export type CommerceAppState = ConfigurationSection &
  ProductListingV2Section &
  RecommendationV2Section &
  CommerceSearchSection &
  CommerceQuerySection &
  FacetOrderSection &
  FacetSearchSection &
  CommerceFacetSetSection &
  CommercePaginationSection &
  CommerceSortSection &
  CommerceContextSection &
  CartSection &
  QuerySuggestionSection &
  QuerySetSection &
  VersionSection;
