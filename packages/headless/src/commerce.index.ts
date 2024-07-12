import {polyfillCryptoNode} from './api/analytics/analytics-crypto-polyfill';
import * as Selectors from './selectors/commerce-selectors.index';
import * as HighlightUtils from './utils/highlight';

export type {HighlightKeyword} from './utils/highlight';

polyfillCryptoNode();
export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';
export type {Relay} from '@coveo/relay';

export type {
  CommerceEngine,
  CommerceEngineConfiguration,
  CommerceEngineOptions,
} from './app/commerce-engine/commerce-engine';
export {buildCommerceEngine} from './app/commerce-engine/commerce-engine';
export {getSampleCommerceEngineConfiguration} from './app/commerce-engine/commerce-engine-configuration';

export type {
  CoreEngine,
  ExternalEngineOptions,
  CoreEngineNext,
} from './app/engine';
export type {
  EngineConfiguration,
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
} from './app/engine-configuration';
export type {LogLevel, LoggerOptions} from './app/logger';
export type {NavigatorContext} from './app/navigatorContextProvider';

export type {
  BaseProduct,
  Product,
  ChildProduct,
} from './api/commerce/common/product';
export type {PlatformEnvironment} from './utils/url-utils';

// Actions
export * from './features/commerce/context/context-actions-loader';
export * from './features/commerce/search/search-actions-loader';
export * from './features/commerce/product-listing/product-listing-actions-loader';
export * from './features/commerce/recommendations/recommendations-actions-loader';
export * from './features/commerce/pagination/pagination-actions-loader';
export * from './features/commerce/product/product-actions-loaders';
export * from './features/commerce/context/cart/cart-actions-loader';
export * from './features/commerce/sort/sort-actions-loader';
export * from './features/commerce/facets/core-facet/core-facet-actions-loader';
export * from './features/commerce/facets/category-facet/category-facet-actions-loader';
export * from './features/commerce/facets/regular-facet/regular-facet-actions-loader';
export * from './features/commerce/facets/date-facet/date-facet-actions-loader';
export * from './features/commerce/facets/numeric-facet/numeric-facet-actions-loader';
export * from './features/commerce/query-set/query-set-actions-loader';
export * from './features/commerce/query-suggest/query-suggest-actions-loader';
export * from './features/commerce/configuration/configuration-actions-loader';
export * from './features/commerce/query/query-actions-loader';
export * from './features/commerce/search-parameters/search-parameters-actions-loader';
export * from './features/commerce/product-listing-parameters/product-listing-parameters-actions-loader';
export * from './features/commerce/triggers/triggers-actions-loader';
export * from './features/commerce/instant-products/instant-products-actions-loader';
export * from './features/commerce/recent-queries/recent-queries-actions-loader';
export * from './features/commerce/standalone-search-box-set/standalone-search-box-set-actions-loader';
// TODO: KIT-3350: Create/use/export remaining commerce actions/loaders

// Selectors
export {Selectors};

// Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller';
export {buildController} from './controllers/controller/headless-controller';

export type {
  ContextOptions,
  View,
  ContextProps,
  Context,
  ContextState,
} from './controllers/commerce/context/headless-context';
export {buildContext} from './controllers/commerce/context/headless-context';

export type {
  Search,
  SearchState,
} from './controllers/commerce/search/headless-search';
export {buildSearch} from './controllers/commerce/search/headless-search';

export type {
  ProductListing,
  ProductListingState,
} from './controllers/commerce/product-listing/headless-product-listing';
export {buildProductListing} from './controllers/commerce/product-listing/headless-product-listing';

export type {
  Recommendations,
  RecommendationsState,
  RecommendationsProps,
  RecommendationsOptions,
} from './controllers/commerce/recommendations/headless-recommendations';
export {buildRecommendations} from './controllers/commerce/recommendations/headless-recommendations';

export type {
  Pagination,
  PaginationState,
  PaginationProps,
  PaginationOptions,
} from './controllers/commerce/core/pagination/headless-core-commerce-pagination';

export type {
  InteractiveProduct,
  InteractiveProductOptions,
  InteractiveProductProps,
} from './controllers/commerce/core/interactive-product/headless-core-interactive-product';

export type {InteractiveResultCore} from './controllers/core/interactive-result/headless-core-interactive-result';

export type {ProductView} from './controllers/commerce/product-view/headless-product-view';
export {buildProductView} from './controllers/commerce/product-view/headless-product-view';

export type {
  CartInitialState,
  CartItem,
  CartProps,
  Cart,
  CartState,
} from './controllers/commerce/context/cart/headless-cart';
export type {Transaction} from './features/commerce/context/cart/cart-selector';
export type {CartItemWithMetadata} from './features/commerce/context/cart/cart-state';
export type {CartItemParam} from './api/commerce/commerce-api-params';
export {buildCart} from './controllers/commerce/context/cart/headless-cart';

export type {
  BaseSolutionTypeSubControllers,
  SearchAndListingSubControllers,
  SearchSubControllers,
} from './controllers/commerce/core/sub-controller/headless-sub-controller';

export type {
  SortByRelevance,
  SortByFields,
  SortByFieldsFields,
  SortCriterion,
  SortProps,
  SortInitialState,
  Sort,
  SortState,
} from './controllers/commerce/core/sort/headless-core-commerce-sort';
export {
  buildRelevanceSortCriterion,
  buildFieldsSortCriterion,
  SortBy,
  SortDirection,
} from './controllers/commerce/core/sort/headless-core-commerce-sort';

export type {
  CategoryFacet,
  CategoryFacetState,
} from './controllers/commerce/core/facets/category/headless-commerce-category-facet';
export type {
  RegularFacet,
  RegularFacetState,
} from './controllers/commerce/core/facets/regular/headless-commerce-regular-facet';
export type {
  NumericFacet,
  NumericFacetDomain,
  NumericFacetState,
} from './controllers/commerce/core/facets/numeric/headless-commerce-numeric-facet';
export {buildDateRange} from './controllers/commerce/core/facets/date/headless-commerce-date-facet';
export type {
  DateFacet,
  DateFacetState,
} from './controllers/commerce/core/facets/date/headless-commerce-date-facet';
export type {DateFilterRange} from './controllers/core/facets/range-facet/date-facet/headless-core-date-filter';
export type {
  FacetType,
  FacetValueRequest,
  RegularFacetValue,
  NumericRangeRequest,
  NumericFacetValue,
  DateRangeRequest,
  DateFacetValue,
  CategoryFacetValueRequest,
  CategoryFacetValue,
} from './controllers/commerce/core/facets/headless-core-commerce-facet';
export type {
  FacetGenerator,
  FacetGeneratorState,
  GeneratedFacetControllers,
  MappedGeneratedFacetController,
} from './controllers/commerce/core/facets/generator/headless-commerce-facet-generator';

export type {FacetValueState} from './features/facets/facet-api/value';

export type {
  RegularFacetSearch,
  RegularFacetSearchState,
} from './controllers/commerce/core/facets/regular/headless-commerce-regular-facet-search';
export type {SpecificFacetSearchResult as RegularFacetSearchResult} from './api/search/facet-search/specific-facet-search/specific-facet-search-response';
export type {
  CategoryFacetSearch,
  CategoryFacetSearchState,
} from './controllers/commerce/core/facets/category/headless-commerce-category-facet-search';
export type {CategoryFacetSearchResult} from './api/search/facet-search/category-facet-search/category-facet-search-response';

export type {BaseFacetSearchResult} from './api/search/facet-search/base/base-facet-search-response';

export {buildSearchBox} from './controllers/commerce/search-box/headless-search-box';
export type {
  SearchBox,
  SearchBoxState,
  SearchBoxProps,
  Suggestion,
  SearchBoxOptions,
} from './controllers/commerce/search-box/headless-search-box';

export {buildRecentQueriesList} from './controllers/commerce/recent-queries-list/headless-recent-queries-list';
export type {RecentQueriesList} from './controllers/commerce/recent-queries-list/headless-recent-queries-list';
export type {
  RecentQueriesListOptions,
  RecentQueriesListProps,
  RecentQueriesListInitialState,
  RecentQueriesState,
} from './controllers/recent-queries-list/headless-recent-queries-list.ts';

export {buildInstantProducts} from './controllers/commerce/instant-products/headless-instant-products';
export type {
  InstantProducts,
  InstantProductsState,
  InstantProductsOptions,
  InstantProductsProps,
} from './controllers/commerce/instant-products/headless-instant-products';
export {buildStandaloneSearchBox} from './controllers/commerce/standalone-search-box/headless-standalone-search-box';
export type {
  StandaloneSearchBox,
  StandaloneSearchBoxState,
} from './controllers/commerce/standalone-search-box/headless-standalone-search-box';
export type {
  StandaloneSearchBoxProps,
  StandaloneSearchBoxOptions,
} from './controllers/standalone-search-box/headless-standalone-search-box.ts';

export type {
  UrlManagerProps,
  UrlManagerInitialState,
  UrlManagerState,
  UrlManager,
} from './controllers/commerce/core/url-manager/headless-core-url-manager';

export type {Template} from './features/templates/templates-manager.ts';
export type {
  ProductTemplate,
  ProductTemplateCondition,
  ProductTemplatesManager,
} from './features/commerce/product-templates/product-templates-manager';
export {buildProductTemplatesManager} from './features/commerce/product-templates/product-templates-manager';

export type {
  BreadcrumbManager,
  Breadcrumb,
  BreadcrumbValue,
  DeselectableValue,
  BreadcrumbManagerState,
} from './controllers/commerce/core/breadcrumb-manager/headless-core-breadcrumb-manager';

export type {SearchSummaryState} from './controllers/commerce/search/summary/headless-search-summary';
export type {ProductListingSummaryState} from './controllers/commerce/product-listing/summary/headless-product-listing-summary';
export type {RecommendationsSummaryState} from './controllers/commerce/recommendations/summary/headless-recommendations-summary';
export type {Summary} from './controllers/commerce/core/summary/headless-core-summary';

export {getOrganizationEndpoints} from './api/platform-client';

export type {
  DidYouMean,
  DidYouMeanState,
  QueryCorrection,
  WordCorrection,
} from './controllers/commerce/search/did-you-mean/headless-did-you-mean';
export {ProductTemplatesHelpers} from './features/commerce/product-templates/product-templates-helpers';

export type {
  NotifyTrigger,
  NotifyTriggerState,
} from './controllers/core/triggers/headless-core-notify-trigger';
export {buildNotifyTrigger} from './controllers/commerce/triggers/headless-commerce-notify-trigger';

export type {
  RedirectionTrigger,
  RedirectionTriggerState,
} from './controllers/core/triggers/headless-core-redirection-trigger';

export {buildRedirectionTrigger} from './controllers/commerce/triggers/headless-commerce-redirection-trigger';

export type {
  QueryTrigger,
  QueryTriggerState,
} from './controllers/core/triggers/headless-core-query-trigger';
export {buildQueryTrigger} from './controllers/commerce/triggers/headless-commerce-query-trigger';

export type {
  FieldSuggestions,
  FieldSuggestionsState,
} from './controllers/commerce/field-suggestions/headless-field-suggestions';
export type {
  CategoryFieldSuggestions,
  CategoryFieldSuggestionsState,
} from './controllers/commerce/field-suggestions/headless-category-field-suggestions';
export type {FieldSuggestionsGenerator} from './controllers/commerce/field-suggestions/headless-field-suggestions-generator';
export type {FieldSuggestionsFacet} from './features/commerce/facets/field-suggestions-order/field-suggestions-order-state.ts';
export {buildFieldSuggestionsGenerator} from './controllers/commerce/field-suggestions/headless-field-suggestions-generator';

export type {
  ParameterManager,
  ParameterManagerState,
  ParameterManagerProps,
  ParameterManagerInitialState,
} from './controllers/commerce/core/parameter-manager/headless-core-parameter-manager';
export type {Parameters} from './features/commerce/parameters/parameters-actions';
export type {SearchParameters} from './features/search-parameters/search-parameter-actions';

// Types & Helpers
export {HighlightUtils};
export {
  deserializeRelativeDate,
  validateRelativeDate,
} from './api/search/date/relative-date';
