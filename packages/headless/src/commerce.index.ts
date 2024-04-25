import {polyfillCryptoNode} from './api/analytics/analytics-crypto-polyfill';

polyfillCryptoNode();
export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';
export type {Relay} from '@coveo/relay';

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

export type {Product} from './api/commerce/common/product';

// Actions
export * from './features/commerce/product-listing/product-listing-actions-loader';
export * from './features/configuration/configuration-actions-loader';

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
} from './controllers/commerce/context/headless-context';
export {buildContext} from './controllers/commerce/context/headless-context';

export type {
  ProductListing,
  ProductListingState,
} from './controllers/commerce/product-listing/headless-product-listing';
export {buildProductListing} from './controllers/commerce/product-listing/headless-product-listing';

export type {
  Recommendations,
  RecommendationsState,
} from './controllers/commerce/recommendations/headless-recommendations';
export {buildRecommendations} from './controllers/commerce/recommendations/headless-recommendations';

export type {
  Pagination,
  PaginationState,
  PaginationProps,
  PaginationOptions,
} from './controllers/commerce/core/pagination/headless-core-commerce-pagination';

export type {
  InteractiveResult,
  InteractiveResultOptions,
  InteractiveResultProps,
} from './controllers/commerce/core/result-list/headless-core-interactive-result';

export type {ProductView} from './controllers/commerce/product-view/headless-product-view';
export {buildProductView} from './controllers/commerce/product-view/headless-product-view';

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

export type {CategoryFacet} from './controllers/commerce/core/facets/category/headless-commerce-category-facet';
export type {RegularFacet} from './controllers/commerce/core/facets/regular/headless-commerce-regular-facet';
export type {NumericFacet} from './controllers/commerce/core/facets/numeric/headless-commerce-numeric-facet';
export type {DateFacet} from './controllers/commerce/core/facets/date/headless-commerce-date-facet';
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
  RegularFacetSearch,
  RegularFacetSearchState,
} from './controllers/commerce/core/facets/regular/headless-commerce-regular-facet-search';
export type {SpecificFacetSearchResult as RegularFacetSearchResult} from './api/search/facet-search/specific-facet-search/specific-facet-search-response';
export type {
  CategoryFacetSearch,
  CategoryFacetSearchState,
} from './controllers/commerce/core/facets/category/headless-commerce-category-facet-search';
export type {CategoryFacetSearchResult} from './api/search/facet-search/category-facet-search/category-facet-search-response';

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
} from './controllers/commerce/core/breadcrumb-manager/headless-core-breadcrumb-manager';

export {getOrganizationEndpoints} from './api/platform-client';
