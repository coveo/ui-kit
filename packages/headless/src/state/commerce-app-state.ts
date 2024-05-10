import {
  CommercePaginationSection,
  CartSection,
  CommerceContextSection,
  ConfigurationSection,
  ProductListingV2Section,
  RecommendationsSection,
  VersionSection,
  CommerceSortSection,
  CommerceSearchSection,
  CommerceQuerySection,
  CommerceFacetSetSection,
  FacetOrderSection,
  QuerySuggestionSection,
  QuerySetSection,
  FacetSearchSection,
  CategoryFacetSearchSection,
  CommerceDidYouMeanSection,
  InstantProductsSection,
  CommerceStandaloneSearchBoxSection,
  RecentQueriesSection,
  TriggerSection,
} from './state-sections';

// eslint-disable-next-line @cspell/spellchecker
// TODO CAPI-546: Handle only the query param for now. Add facets, sort, pagination later.
export type CommerceSearchParametersState = CommerceQuerySection;
export type CommerceProductListingParametersState = {};

export type CommerceAppState = ConfigurationSection &
  CommerceStandaloneSearchBoxSection &
  ProductListingV2Section &
  RecommendationsSection &
  CommerceSearchSection &
  CommerceQuerySection &
  FacetOrderSection &
  FacetSearchSection &
  CategoryFacetSearchSection &
  CommerceFacetSetSection &
  CommercePaginationSection &
  CommerceSortSection &
  CommerceContextSection &
  CartSection &
  RecentQueriesSection &
  QuerySuggestionSection &
  QuerySetSection &
  CommerceDidYouMeanSection &
  InstantProductsSection &
  TriggerSection &
  VersionSection;
