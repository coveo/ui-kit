import {
  CommercePaginationSection,
  CartSection,
  CommerceContextSection,
  ProductListingSection,
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
  ManualRangeSection,
  CommerceConfigurationSection,
} from './state-sections.js';

export type CommerceProductListingParametersState = CommerceFacetSetSection &
  CommerceSortSection &
  CommercePaginationSection;
export type CommerceSearchParametersState =
  CommerceProductListingParametersState & CommerceQuerySection;

export type CommerceAppState = CommerceConfigurationSection &
  CommerceStandaloneSearchBoxSection &
  ProductListingSection &
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
  ManualRangeSection &
  VersionSection;
