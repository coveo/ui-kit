import {polyfillCryptoNode} from './api/analytics/analytics-crypto-polyfill';

polyfillCryptoNode();
export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';

export type {
  CommerceEngine,
  CommerceEngineConfiguration,
  CommerceEngineOptions,
} from './app/commerce-engine/commerce-engine';
export {buildCommerceEngine} from './app/commerce-engine/commerce-engine';

export type {CoreEngine, ExternalEngineOptions} from './app/engine';
export type {
  EngineConfiguration,
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
} from './app/engine-configuration';
export type {LogLevel, LoggerOptions} from './app/logger';

export type {ProductRecommendation} from './api/search/search/product-recommendation';

// Actions
export * from './features/commerce/product-listing/product-listing-actions-loader';
export * from './features/configuration/configuration-actions-loader';
export * from './features/analytics/search-analytics-actions-loader';

// Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller';
export {buildController} from './controllers/controller/headless-controller';

export type {
  ContextOptions,
  User,
  View,
  ContextProps,
  Context,
  ContextState,
  ContextControllerState,
} from './controllers/commerce/context/headless-context';
export {buildContext} from './controllers/commerce/context/headless-context';

export type {
  ProductListing,
  ProductListingState,
  ProductListingControllerState,
} from './controllers/commerce/product-listing/headless-product-listing';
export {buildProductListing} from './controllers/commerce/product-listing/headless-product-listing';

export type {
  Pagination,
  PaginationState,
  PaginationControllerState,
} from './controllers/commerce/core/pagination/headless-core-commerce-pagination';
export {buildProductListingPagination} from './controllers/commerce/product-listing/pagination/headless-product-listing-pagination';
export {buildSearchPagination} from './controllers/commerce/search/pagination/headless-search-pagination';

export type {
  InteractiveResult,
  InteractiveResultOptions,
  InteractiveResultProps,
} from './controllers/commerce/product-listing/result-list/headless-product-listing-interactive-result';
export {buildInteractiveResult} from './controllers/commerce/product-listing/result-list/headless-product-listing-interactive-result';

export type {
  CartInitialState,
  CartItem,
  CartProps,
  Cart,
  CartState,
} from './controllers/commerce/context/cart/headless-cart';
export {buildCart} from './controllers/commerce/context/cart/headless-cart';

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

export {buildProductListingSort} from './controllers/commerce/product-listing/sort/headless-product-listing-sort';
export {buildSearchSort} from './controllers/commerce/search/sort/headless-search-sort';

export type {CommerceRegularFacet} from './controllers/commerce/core/facets/regular/headless-commerce-regular-facet';
export type {CommerceNumericFacet} from './controllers/commerce/core/facets/numeric/headless-commerce-numeric-facet';
export type {CommerceDateFacet} from './controllers/commerce/core/facets/date/headless-commerce-date-facet';
export type {
  FacetType,
  FacetValueRequest,
  RegularFacetValue,
  NumericRangeRequest,
  NumericFacetValue,
  DateRangeRequest,
  DateFacetValue,
} from './controllers/commerce/core/facets/headless-core-commerce-facet';
export type {ProductListingFacetGenerator} from './controllers/commerce/product-listing/facets/headless-product-listing-facet-generator';
export {buildProductListingFacetGenerator} from './controllers/commerce/product-listing/facets/headless-product-listing-facet-generator';
export type {SearchFacetGenerator} from './controllers/commerce/search/facets/headless-search-facet-generator';
export {buildSearchFacetGenerator} from './controllers/commerce/search/facets/headless-search-facet-generator';

export type {Search} from './controllers/commerce/search/headless-search';
export {buildSearch} from './controllers/commerce/search/headless-search';

export {updateQuery} from './features/commerce/query/query-actions';

export {buildSearchBox} from './controllers/commerce/search-box/headless-search-box';
export type {
  SearchBox,
  SearchBoxState,
} from './controllers/commerce/search-box/headless-search-box';

export type {
  UrlManagerProps,
  UrlManagerInitialState,
  UrlManagerState,
  UrlManager,
} from './controllers/commerce/core/url-manager/headless-core-url-manager';
export {buildCoreUrlManager} from './controllers/commerce/core/url-manager/headless-core-url-manager';

export {buildSearchUrlManager} from './controllers/commerce/search/url-manager/headless-search-url-manager';
export {buildProductListingUrlManager} from './controllers/commerce/product-listing/url-manager/headless-product-listing-url-manager';

export type {CommerceRoute} from './routes/commerce';
export {buildProductListingRoute, buildSearchRoute, buildProductRoute} from './routes/commerce'
