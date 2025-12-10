/**
 * The Coveo Headless Commerce sub-package exposes the engine, controllers, actions, and utility functions to
 * build a [commerce search experience](https://docs.coveo.com/en/o6r70022/).
 *
 * @example
 * ```typescript
 * import { buildCommerceEngine, getSampleCommerceEngineConfiguration, buildSearch } from '@coveo/headless/commerce';
 *
 * const engine = buildCommerceEngine({
 *  configuration: getSampleCommerceEngineConfiguration(),
 * });
 *
 * const search = buildSearch(engine);
 * search.executeFirstSearch();
 * ```
 *
 * @module Commerce
 */
import * as Selectors from './selectors/commerce-selectors.index.js';
import * as HighlightUtils from './utils/highlight.js';

export type {Relay} from '@coveo/relay';
export type {Middleware, Unsubscribe} from '@reduxjs/toolkit';
export {getCommerceApiBaseUrl} from './api/commerce/commerce-api-client.js';
export type {
  BaseProduct,
  ChildProduct,
  Product,
} from './api/commerce/common/product.js';
export type {
  BaseResult,
  Result,
  SpotlightContent,
} from './api/commerce/common/result.js';
export {ResultType} from './api/commerce/common/result.js';
export {
  getAnalyticsNextApiBaseUrl,
  getOrganizationEndpoint,
} from './api/platform-client.js';

export type {
  CommerceEngine,
  CommerceEngineConfiguration,
  CommerceEngineOptions,
} from './app/commerce-engine/commerce-engine.js';
export {buildCommerceEngine} from './app/commerce-engine/commerce-engine.js';
export {getSampleCommerceEngineConfiguration} from './app/commerce-engine/commerce-engine-configuration.js';

export type {
  CoreEngine,
  CoreEngineNext,
  ExternalEngineOptions,
} from './app/engine.js';
export type {
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
  EngineConfiguration,
} from './app/engine-configuration.js';
export type {LoggerOptions, LogLevel} from './app/logger.js';
export type {NavigatorContext} from './app/navigator-context-provider.js';
export * from './features/commerce/configuration/configuration-actions-loader.js';
export * from './features/commerce/context/cart/cart-actions-loader.js';

// Actions
export * from './features/commerce/context/context-actions-loader.js';
export * from './features/commerce/facets/category-facet/category-facet-actions-loader.js';
export * from './features/commerce/facets/core-facet/core-facet-actions-loader.js';
export * from './features/commerce/facets/date-facet/date-facet-actions-loader.js';
export * from './features/commerce/facets/location-facet/location-facet-actions-loader.js';
export * from './features/commerce/facets/numeric-facet/numeric-facet-actions-loader.js';
export * from './features/commerce/facets/regular-facet/regular-facet-actions-loader.js';
export * from './features/commerce/instant-products/instant-products-actions-loader.js';
export * from './features/commerce/pagination/pagination-actions-loader.js';
export * from './features/commerce/product/product-actions-loaders.js';
export * from './features/commerce/product-enrichment/product-enrichment-actions-loader.js';
export * from './features/commerce/product-listing/product-listing-actions-loader.js';
export * from './features/commerce/product-listing-parameters/product-listing-parameters-actions-loader.js';
export * from './features/commerce/query/query-actions-loader.js';
export * from './features/commerce/query-set/query-set-actions-loader.js';
export * from './features/commerce/query-suggest/query-suggest-actions-loader.js';
export * from './features/commerce/recent-queries/recent-queries-actions-loader.js';
export * from './features/commerce/recommendations/recommendations-actions-loader.js';
export * from './features/commerce/search/search-actions-loader.js';
export * from './features/commerce/search-parameters/search-parameters-actions-loader.js';
export * from './features/commerce/sort/sort-actions-loader.js';
export * from './features/commerce/standalone-search-box-set/standalone-search-box-set-actions-loader.js';
export * from './features/commerce/triggers/triggers-actions-loader.js';
export type {HighlightKeyword} from './utils/highlight.js';
export type {PlatformEnvironment} from './utils/url-utils.js';

// Selectors
export {Selectors};

export type {CartItemParam} from './api/commerce/commerce-api-params.js';
export type {
  Badge,
  BadgePlacement,
  BadgesProduct,
} from './api/commerce/product-enrichment/product-enrichment-response.js';
export type {CategoryFacetSearchResult} from './api/search/facet-search/category-facet-search/category-facet-search-response.js';
export type {SpecificFacetSearchResult as RegularFacetSearchResult} from './api/search/facet-search/specific-facet-search/specific-facet-search-response.js';
export type {
  Cart,
  CartInitialState,
  CartItem,
  CartProps,
  CartState,
} from './controllers/commerce/context/cart/headless-cart.js';
export {buildCart} from './controllers/commerce/context/cart/headless-cart.js';
export type {
  Context,
  ContextOptions,
  ContextProps,
  ContextState,
  UserLocation,
  View,
} from './controllers/commerce/context/headless-context.js';
export {buildContext} from './controllers/commerce/context/headless-context.js';
export type {
  Breadcrumb,
  BreadcrumbManager,
  BreadcrumbManagerState,
  BreadcrumbValue,
  DeselectableValue,
} from './controllers/commerce/core/breadcrumb-manager/headless-core-breadcrumb-manager.js';
export type {
  CategoryFacet,
  CategoryFacetState,
} from './controllers/commerce/core/facets/category/headless-commerce-category-facet.js';
export type {
  CategoryFacetSearch,
  CategoryFacetSearchState,
} from './controllers/commerce/core/facets/category/headless-commerce-category-facet-search.js';
export type {
  DateFacet,
  DateFacetState,
} from './controllers/commerce/core/facets/date/headless-commerce-date-facet.js';
export {buildDateRange} from './controllers/commerce/core/facets/date/headless-commerce-date-facet.js';
export type {
  FacetGenerator,
  FacetGeneratorState,
  GeneratedFacetControllers,
  MappedGeneratedFacetController,
} from './controllers/commerce/core/facets/generator/headless-commerce-facet-generator.js';
export type {
  BaseFacetValue,
  CategoryFacetValue,
  CategoryFacetValueRequest,
  DateFacetValue,
  DateRangeRequest,
  FacetType,
  FacetValueRequest,
  LocationFacetValue,
  LocationFacetValueRequest,
  NumericFacetValue,
  NumericRangeRequest,
  RegularFacetValue,
} from './controllers/commerce/core/facets/headless-core-commerce-facet.js';
export type {
  LocationFacet,
  LocationFacetState,
} from './controllers/commerce/core/facets/location/headless-commerce-location-facet.js';
export type {
  NumericFacet,
  NumericFacetState,
} from './controllers/commerce/core/facets/numeric/headless-commerce-numeric-facet.js';
export type {
  RegularFacet,
  RegularFacetState,
} from './controllers/commerce/core/facets/regular/headless-commerce-regular-facet.js';
export type {
  RegularFacetSearch,
  RegularFacetSearchState,
} from './controllers/commerce/core/facets/regular/headless-commerce-regular-facet-search.js';
export type {
  InteractiveProduct,
  InteractiveProductOptions,
  InteractiveProductProps,
} from './controllers/commerce/core/interactive-product/headless-core-interactive-product.js';
export type {
  Pagination,
  PaginationOptions,
  PaginationProps,
  PaginationState,
} from './controllers/commerce/core/pagination/headless-core-commerce-pagination.js';
export type {
  ParameterManager,
  ParameterManagerInitialState,
  ParameterManagerProps,
  ParameterManagerState,
} from './controllers/commerce/core/parameter-manager/headless-core-parameter-manager.js';
export type {
  Sort,
  SortByFields,
  SortByFieldsFields,
  SortByRelevance,
  SortCriterion,
  SortInitialState,
  SortProps,
  SortState,
} from './controllers/commerce/core/sort/headless-core-commerce-sort.js';
export {
  buildFieldsSortCriterion,
  buildRelevanceSortCriterion,
  SortBy,
  SortDirection,
} from './controllers/commerce/core/sort/headless-core-commerce-sort.js';
export type {
  BaseSolutionTypeSubControllers,
  SearchAndListingSubControllers,
  SearchSubControllers,
} from './controllers/commerce/core/sub-controller/headless-sub-controller.js';
export type {Summary} from './controllers/commerce/core/summary/headless-core-summary.js';
export type {
  BaseUrlManagerProps,
  UrlManager,
  UrlManagerInitialState,
  UrlManagerProps,
  UrlManagerState,
} from './controllers/commerce/core/url-manager/headless-core-url-manager.js';
export type {
  CategoryFieldSuggestions,
  CategoryFieldSuggestionsState,
} from './controllers/commerce/field-suggestions/headless-category-field-suggestions.js';
export type {
  FieldSuggestionsGenerator,
  GeneratedFieldSuggestionsControllers,
} from './controllers/commerce/field-suggestions/headless-field-suggestions-generator.js';
export {buildFieldSuggestionsGenerator} from './controllers/commerce/field-suggestions/headless-field-suggestions-generator.js';
export type {
  CategoryFilterSuggestions,
  CategoryFilterSuggestionsState,
} from './controllers/commerce/filter-suggestions/headless-category-filter-suggestions.js';
export {buildCategoryFilterSuggestions} from './controllers/commerce/filter-suggestions/headless-category-filter-suggestions.js';
export type {
  FilterSuggestions,
  FilterSuggestionsState,
} from './controllers/commerce/filter-suggestions/headless-filter-suggestions.js';
export {buildFilterSuggestions} from './controllers/commerce/filter-suggestions/headless-filter-suggestions.js';
export type {
  FilterSuggestionsGenerator,
  GeneratedFilterSuggestionsControllers,
} from './controllers/commerce/filter-suggestions/headless-filter-suggestions-generator.js';
export {buildFilterSuggestionsGenerator} from './controllers/commerce/filter-suggestions/headless-filter-suggestions-generator.js';
export type {
  InstantProducts,
  InstantProductsOptions,
  InstantProductsProps,
  InstantProductsState,
} from './controllers/commerce/instant-products/headless-instant-products.js';
export {buildInstantProducts} from './controllers/commerce/instant-products/headless-instant-products.js';
export type {
  ProductEnrichment,
  ProductEnrichmentOptions,
  ProductEnrichmentProps,
  ProductEnrichmentState,
} from './controllers/commerce/product-enrichment/headless-product-enrichment.js';
export {buildProductEnrichment} from './controllers/commerce/product-enrichment/headless-product-enrichment.js';
export type {
  ProductListing,
  ProductListingOptions,
  ProductListingState,
} from './controllers/commerce/product-listing/headless-product-listing.js';
export {buildProductListing} from './controllers/commerce/product-listing/headless-product-listing.js';
export type {ProductListingSummaryState} from './controllers/commerce/product-listing/summary/headless-product-listing-summary.js';
export type {ProductView} from './controllers/commerce/product-view/headless-product-view.js';
export {buildProductView} from './controllers/commerce/product-view/headless-product-view.js';
export type {
  RecentQueriesList,
  RecentQueriesListInitialState,
  RecentQueriesListOptions,
  RecentQueriesListProps,
  RecentQueriesState,
} from './controllers/commerce/recent-queries-list/headless-recent-queries-list.js';
export {buildRecentQueriesList} from './controllers/commerce/recent-queries-list/headless-recent-queries-list.js';
export type {
  Recommendations,
  RecommendationsOptions,
  RecommendationsProps,
  RecommendationsState,
} from './controllers/commerce/recommendations/headless-recommendations.js';
export {buildRecommendations} from './controllers/commerce/recommendations/headless-recommendations.js';
export type {RecommendationsSummaryState} from './controllers/commerce/recommendations/summary/headless-recommendations-summary.js';
export type {
  DidYouMean,
  DidYouMeanState,
  QueryCorrection,
  WordCorrection,
} from './controllers/commerce/search/did-you-mean/headless-did-you-mean.js';
export type {
  Search,
  SearchState,
} from './controllers/commerce/search/headless-search.js';
export {buildSearch} from './controllers/commerce/search/headless-search.js';

export type {SearchSummaryState} from './controllers/commerce/search/summary/headless-search-summary.js';
export type {
  SearchBox,
  SearchBoxOptions,
  SearchBoxProps,
  SearchBoxState,
  Suggestion,
} from './controllers/commerce/search-box/headless-search-box.js';
export {buildSearchBox} from './controllers/commerce/search-box/headless-search-box.js';
export type {
  StandaloneSearchBox,
  StandaloneSearchBoxState,
} from './controllers/commerce/standalone-search-box/headless-standalone-search-box.js';
export {buildStandaloneSearchBox} from './controllers/commerce/standalone-search-box/headless-standalone-search-box.js';
export {buildNotifyTrigger} from './controllers/commerce/triggers/headless-notify-trigger.js';
export {buildQueryTrigger} from './controllers/commerce/triggers/headless-query-trigger.js';
export {buildRedirectionTrigger} from './controllers/commerce/triggers/headless-redirection-trigger.js';
// Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller.js';
export {buildController} from './controllers/controller/headless-controller.js';
export type {DateFilterRange} from './controllers/core/facets/range-facet/date-facet/headless-core-date-filter.js';
export type {InteractiveResultCore} from './controllers/core/interactive-result/headless-core-interactive-result.js';
export type {
  NotifyTrigger,
  NotifyTriggerState,
} from './controllers/core/triggers/headless-core-notify-trigger.js';
export type {
  QueryTrigger,
  QueryTriggerState,
} from './controllers/core/triggers/headless-core-query-trigger.js';
export type {
  RedirectionTrigger,
  RedirectionTriggerState,
} from './controllers/core/triggers/headless-core-redirection-trigger.js';
export type {
  StandaloneSearchBoxOptions,
  StandaloneSearchBoxProps,
} from './controllers/standalone-search-box/headless-standalone-search-box.ts';
export type {Transaction} from './features/commerce/context/cart/cart-selector.js';
export type {CartItemWithMetadata} from './features/commerce/context/cart/cart-state.js';
export type {FieldSuggestionsFacet} from './features/commerce/facets/field-suggestions-order/field-suggestions-order-state.ts';
export type {Parameters} from './features/commerce/parameters/parameters-actions.js';
export {ProductTemplatesHelpers} from './features/commerce/product-templates/product-templates-helpers.js';
export type {
  ProductTemplate,
  ProductTemplateCondition,
  ProductTemplatesManager,
} from './features/commerce/product-templates/product-templates-manager.js';
export {buildProductTemplatesManager} from './features/commerce/product-templates/product-templates-manager.js';
export type {CommerceSearchParameters} from './features/commerce/search-parameters/search-parameters-actions.js';
export type {SearchParameters} from './features/search-parameters/search-parameter-actions.js';
export type {Template} from './features/templates/templates-manager.ts';

// Types & Helpers
export {HighlightUtils};
export {
  deserializeRelativeDate,
  validateRelativeDate,
} from './api/search/date/relative-date.js';

export {
  productListingSerializer,
  searchSerializer,
} from './features/commerce/parameters/parameters-serializer.js';
export {VERSION} from './utils/version.js';
