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

export type CommerceProductListingParametersState = CommerceFacetSetSection &
  CommerceSortSection &
  CommercePaginationSection;
export type CommerceSearchParametersState =
  CommerceProductListingParametersState & CommerceQuerySection;

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
