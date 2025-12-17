import type {
  CartSection,
  CategoryFacetSearchSection,
  CommerceConfigurationSection,
  CommerceContextSection,
  CommerceDidYouMeanSection,
  CommerceFacetSetSection,
  CommercePaginationSection,
  CommerceParametersSection,
  CommerceQuerySection,
  CommerceSearchSection,
  CommerceSortSection,
  CommerceStandaloneSearchBoxSection,
  FacetOrderSection,
  FacetSearchSection,
  FieldSuggestionsOrderSection,
  InstantProductsSection,
  ManualRangeSection,
  ProductEnrichmentSection,
  ProductListingSection,
  QuerySetSection,
  QuerySuggestionSection,
  RecentQueriesSection,
  RecommendationsSection,
  TriggerSection,
  VersionSection,
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
  CommerceParametersSection &
  CartSection &
  RecentQueriesSection &
  QuerySuggestionSection &
  QuerySetSection &
  CommerceDidYouMeanSection &
  InstantProductsSection &
  FieldSuggestionsOrderSection &
  TriggerSection &
  ManualRangeSection &
  ProductEnrichmentSection &
  VersionSection;
