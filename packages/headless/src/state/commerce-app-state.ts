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
  FieldSuggestionsOrderSection,
  TriggerSection,
} from './state-sections';

// eslint-disable-next-line @cspell/spellchecker
// TODO CAPI-907: Handle sort and pagination
export type CommerceSearchParametersState = CommerceQuerySection &
  CommerceFacetSetSection;
export type CommerceProductListingParametersState = CommerceFacetSetSection;

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
  FieldSuggestionsOrderSection &
  TriggerSection &
  VersionSection;
