import * as Selectors from './selectors/commerce-selectors.index.js';
import * as HighlightUtils from './utils/highlight.js';

export {
  getOrganizationEndpoint,
  getAnalyticsNextApiBaseUrl,
} from './api/platform-client.js';
export {getCommerceApiBaseUrl} from './api/commerce/commerce-api-client.js';
export type {HighlightKeyword} from './utils/highlight.js';

export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';
export type {Relay} from '@coveo/relay';

export type {
  CommerceEngine,
  CommerceEngineConfiguration,
  CommerceEngineOptions,
} from './app/commerce-engine/commerce-engine.js';
export {buildCommerceEngine} from './app/commerce-engine/commerce-engine.js';
export {getSampleCommerceEngineConfiguration} from './app/commerce-engine/commerce-engine-configuration.js';

export type {
  CoreEngine,
  ExternalEngineOptions,
  CoreEngineNext,
} from './app/engine.js';
export type {
  EngineConfiguration,
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
} from './app/engine-configuration.js';
export type {LogLevel, LoggerOptions} from './app/logger.js';
export type {NavigatorContext} from './app/navigatorContextProvider.js';

export type {
  BaseProduct,
  Product,
  ChildProduct,
} from './api/commerce/common/product.js';
export type {PlatformEnvironment} from './utils/url-utils.js';

// Actions
export * from './features/commerce/context/context-actions-loader.js';
export * from './features/commerce/search/search-actions-loader.js';
export * from './features/commerce/product-listing/product-listing-actions-loader.js';
export * from './features/commerce/recommendations/recommendations-actions-loader.js';
export * from './features/commerce/pagination/pagination-actions-loader.js';
export * from './features/commerce/product/product-actions-loaders.js';
export * from './features/commerce/context/cart/cart-actions-loader.js';
export * from './features/commerce/sort/sort-actions-loader.js';
export * from './features/commerce/facets/core-facet/core-facet-actions-loader.js';
export * from './features/commerce/facets/category-facet/category-facet-actions-loader.js';
export * from './features/commerce/facets/regular-facet/regular-facet-actions-loader.js';
export * from './features/commerce/facets/location-facet/location-facet-actions-loader.js';
export * from './features/commerce/facets/date-facet/date-facet-actions-loader.js';
export * from './features/commerce/facets/numeric-facet/numeric-facet-actions-loader.js';
export * from './features/commerce/query-set/query-set-actions-loader.js';
export * from './features/commerce/query-suggest/query-suggest-actions-loader.js';
export * from './features/commerce/configuration/configuration-actions-loader.js';
export * from './features/commerce/query/query-actions-loader.js';
export * from './features/commerce/search-parameters/search-parameters-actions-loader.js';
export * from './features/commerce/product-listing-parameters/product-listing-parameters-actions-loader.js';
export * from './features/commerce/triggers/triggers-actions-loader.js';
export * from './features/commerce/instant-products/instant-products-actions-loader.js';
export * from './features/commerce/recent-queries/recent-queries-actions-loader.js';
export * from './features/commerce/standalone-search-box-set/standalone-search-box-set-actions-loader.js';

// Selectors
export {Selectors};

// Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller.js';
export {buildController} from './controllers/controller/headless-controller.js';

export type {
  ContextOptions,
  View,
  UserLocation,
  ContextProps,
  Context,
  ContextState,
} from './controllers/commerce/context/headless-context.js';
export {buildContext} from './controllers/commerce/context/headless-context.js';

export type {
  Search,
  SearchState,
} from './controllers/commerce/search/headless-search.js';
export {buildSearch} from './controllers/commerce/search/headless-search.js';

export type {
  ProductListing,
  ProductListingState,
} from './controllers/commerce/product-listing/headless-product-listing.js';
export {buildProductListing} from './controllers/commerce/product-listing/headless-product-listing.js';

export type {
  Recommendations,
  RecommendationsState,
  RecommendationsProps,
  RecommendationsOptions,
} from './controllers/commerce/recommendations/headless-recommendations.js';
export {buildRecommendations} from './controllers/commerce/recommendations/headless-recommendations.js';

export type {
  Pagination,
  PaginationState,
  PaginationProps,
  PaginationOptions,
} from './controllers/commerce/core/pagination/headless-core-commerce-pagination.js';

export type {
  InteractiveProduct,
  InteractiveProductOptions,
  InteractiveProductProps,
} from './controllers/commerce/core/interactive-product/headless-core-interactive-product.js';

export type {InteractiveResultCore} from './controllers/core/interactive-result/headless-core-interactive-result.js';

export type {ProductView} from './controllers/commerce/product-view/headless-product-view.js';
export {buildProductView} from './controllers/commerce/product-view/headless-product-view.js';

export type {
  CartInitialState,
  CartItem,
  CartProps,
  Cart,
  CartState,
} from './controllers/commerce/context/cart/headless-cart.js';
export type {Transaction} from './features/commerce/context/cart/cart-selector.js';
export type {CartItemWithMetadata} from './features/commerce/context/cart/cart-state.js';
export type {CartItemParam} from './api/commerce/commerce-api-params.js';
export {buildCart} from './controllers/commerce/context/cart/headless-cart.js';

export type {
  BaseSolutionTypeSubControllers,
  SearchAndListingSubControllers,
  SearchSubControllers,
} from './controllers/commerce/core/sub-controller/headless-sub-controller.js';

export type {
  SortByRelevance,
  SortByFields,
  SortByFieldsFields,
  SortCriterion,
  SortProps,
  SortInitialState,
  Sort,
  SortState,
} from './controllers/commerce/core/sort/headless-core-commerce-sort.js';
export {
  buildRelevanceSortCriterion,
  buildFieldsSortCriterion,
  SortBy,
  SortDirection,
} from './controllers/commerce/core/sort/headless-core-commerce-sort.js';

export type {
  CategoryFacet,
  CategoryFacetState,
} from './controllers/commerce/core/facets/category/headless-commerce-category-facet.js';
export type {
  RegularFacet,
  RegularFacetState,
} from './controllers/commerce/core/facets/regular/headless-commerce-regular-facet.js';
export type {
  LocationFacet,
  LocationFacetState,
} from './controllers/commerce/core/facets/location/headless-commerce-location-facet.js';
export type {
  NumericFacet,
  NumericFacetState,
} from './controllers/commerce/core/facets/numeric/headless-commerce-numeric-facet.js';
export {buildDateRange} from './controllers/commerce/core/facets/date/headless-commerce-date-facet.js';
export type {
  DateFacet,
  DateFacetState,
} from './controllers/commerce/core/facets/date/headless-commerce-date-facet.js';
export type {DateFilterRange} from './controllers/core/facets/range-facet/date-facet/headless-core-date-filter.js';
export type {
  FacetType,
  BaseFacetValue,
  FacetValueRequest,
  RegularFacetValue,
  LocationFacetValueRequest,
  LocationFacetValue,
  NumericRangeRequest,
  NumericFacetValue,
  DateRangeRequest,
  DateFacetValue,
  CategoryFacetValueRequest,
  CategoryFacetValue,
} from './controllers/commerce/core/facets/headless-core-commerce-facet.js';
export type {FacetGenerator} from './controllers/commerce/core/facets/generator/headless-commerce-facet-generator.js';

export type {FacetGeneratorState} from './controllers/commerce/core/facets/generator/headless-commerce-facet-generator.js';

export type {
  RegularFacetSearch,
  RegularFacetSearchState,
} from './controllers/commerce/core/facets/regular/headless-commerce-regular-facet-search.js';
export type {SpecificFacetSearchResult as RegularFacetSearchResult} from './api/search/facet-search/specific-facet-search/specific-facet-search-response.js';
export type {
  CategoryFacetSearch,
  CategoryFacetSearchState,
} from './controllers/commerce/core/facets/category/headless-commerce-category-facet-search.js';
export type {CategoryFacetSearchResult} from './api/search/facet-search/category-facet-search/category-facet-search-response.js';

export {buildSearchBox} from './controllers/commerce/search-box/headless-search-box.js';
export type {
  SearchBox,
  SearchBoxState,
  SearchBoxProps,
  Suggestion,
  SearchBoxOptions,
} from './controllers/commerce/search-box/headless-search-box.js';

export {buildRecentQueriesList} from './controllers/commerce/recent-queries-list/headless-recent-queries-list.js';
export type {
  RecentQueriesList,
  RecentQueriesListOptions,
  RecentQueriesListProps,
  RecentQueriesListInitialState,
  RecentQueriesState,
} from './controllers/commerce/recent-queries-list/headless-recent-queries-list.js';

export {buildInstantProducts} from './controllers/commerce/instant-products/headless-instant-products.js';
export type {
  InstantProducts,
  InstantProductsState,
  InstantProductsOptions,
  InstantProductsProps,
} from './controllers/commerce/instant-products/headless-instant-products.js';
export {buildStandaloneSearchBox} from './controllers/commerce/standalone-search-box/headless-standalone-search-box.js';
export type {
  StandaloneSearchBox,
  StandaloneSearchBoxState,
} from './controllers/commerce/standalone-search-box/headless-standalone-search-box.js';
export type {
  StandaloneSearchBoxProps,
  StandaloneSearchBoxOptions,
} from './controllers/standalone-search-box/headless-standalone-search-box.ts';

export type {
  UrlManagerProps,
  UrlManagerInitialState,
  UrlManagerState,
  UrlManager,
} from './controllers/commerce/core/url-manager/headless-core-url-manager.js';

export type {Template} from './features/templates/templates-manager.ts';
export type {
  ProductTemplate,
  ProductTemplateCondition,
  ProductTemplatesManager,
} from './features/commerce/product-templates/product-templates-manager.js';
export {buildProductTemplatesManager} from './features/commerce/product-templates/product-templates-manager.js';

export type {
  BreadcrumbManager,
  Breadcrumb,
  BreadcrumbValue,
  DeselectableValue,
  BreadcrumbManagerState,
} from './controllers/commerce/core/breadcrumb-manager/headless-core-breadcrumb-manager.js';

export type {SearchSummaryState} from './controllers/commerce/search/summary/headless-search-summary.js';
export type {ProductListingSummaryState} from './controllers/commerce/product-listing/summary/headless-product-listing-summary.js';
export type {RecommendationsSummaryState} from './controllers/commerce/recommendations/summary/headless-recommendations-summary.js';
export type {Summary} from './controllers/commerce/core/summary/headless-core-summary.js';

export type {
  DidYouMean,
  DidYouMeanState,
  QueryCorrection,
  WordCorrection,
} from './controllers/commerce/search/did-you-mean/headless-did-you-mean.js';
export {ProductTemplatesHelpers} from './features/commerce/product-templates/product-templates-helpers.js';

export type {
  NotifyTrigger,
  NotifyTriggerState,
} from './controllers/core/triggers/headless-core-notify-trigger.js';
export {buildNotifyTrigger} from './controllers/commerce/triggers/headless-notify-trigger.js';

export type {
  RedirectionTrigger,
  RedirectionTriggerState,
} from './controllers/core/triggers/headless-core-redirection-trigger.js';

export {buildRedirectionTrigger} from './controllers/commerce/triggers/headless-redirection-trigger.js';

export type {
  QueryTrigger,
  QueryTriggerState,
} from './controllers/core/triggers/headless-core-query-trigger.js';
export {buildQueryTrigger} from './controllers/commerce/triggers/headless-query-trigger.js';

export type {
  FieldSuggestions,
  FieldSuggestionsState,
} from './controllers/commerce/field-suggestions/headless-field-suggestions.js';
export type {
  CategoryFieldSuggestions,
  CategoryFieldSuggestionsState,
} from './controllers/commerce/field-suggestions/headless-category-field-suggestions.js';
export type {
  FieldSuggestionsGenerator,
  GeneratedFieldSuggestionsControllers,
} from './controllers/commerce/field-suggestions/headless-field-suggestions-generator.js';
export type {FieldSuggestionsFacet} from './features/commerce/facets/field-suggestions-order/field-suggestions-order-state.ts';
export {buildFieldSuggestionsGenerator} from './controllers/commerce/field-suggestions/headless-field-suggestions-generator.js';

export type {
  ParameterManager,
  ParameterManagerState,
  ParameterManagerProps,
  ParameterManagerInitialState,
} from './controllers/commerce/core/parameter-manager/headless-core-parameter-manager.js';
export type {Parameters} from './features/commerce/parameters/parameters-actions.js';
export type {SearchParameters} from './features/search-parameters/search-parameter-actions.js';

// Types & Helpers
export {HighlightUtils};
export {
  deserializeRelativeDate,
  validateRelativeDate,
} from './api/search/date/relative-date.js';
