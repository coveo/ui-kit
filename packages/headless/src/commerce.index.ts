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

export type {Product} from './api/commerce/common/product';
export type {PlatformEnvironment} from './utils/url-utils';

// Actions
export * from './features/commerce/product-listing/product-listing-actions-loader';
export * from './features/commerce/query-suggest/query-suggest-actions-loader';
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
export {buildProductListingPagination} from './controllers/commerce/product-listing/pagination/headless-product-listing-pagination';
export {buildSearchPagination} from './controllers/commerce/search/pagination/headless-search-pagination';

export type {
  InteractiveProduct,
  InteractiveProductOptions,
  InteractiveProductProps,
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
export type {Transaction} from './features/commerce/context/cart/cart-selector';
export type {CartItemWithMetadata} from './features/commerce/context/cart/cart-state';
export type {CartItemParam} from './api/commerce/commerce-api-params';
export {buildCart} from './controllers/commerce/context/cart/headless-cart';

export type {
  BaseSolutionTypeSubControllers,
  SearchAndListingSubControllers,
} from './controllers/commerce/core/sub-controller/headless-sub-controller';

export type {
  ParameterManager,
  ParameterManagerState,
  ParameterManagerProps,
  ParameterManagerInitialState,
} from './controllers/commerce/core/parameter-manager/headless-core-parameter-manager';
export {buildProductListingParameterManager} from './controllers/commerce/product-listing/parameter-manager/headless-product-listing-parameter-manager';

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
  NumericFacetState,
} from './controllers/commerce/core/facets/numeric/headless-commerce-numeric-facet';
export type {
  DateFacet,
  DateFacetState,
} from './controllers/commerce/core/facets/date/headless-commerce-date-facet';
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
export type {ProductListingFacetGenerator} from './controllers/commerce/product-listing/facets/headless-product-listing-facet-generator';
export {buildProductListingFacetGenerator} from './controllers/commerce/product-listing/facets/headless-product-listing-facet-generator';
export type {SearchFacetGenerator} from './controllers/commerce/search/facets/headless-search-facet-generator';
export {buildSearchFacetGenerator} from './controllers/commerce/search/facets/headless-search-facet-generator';
export type {SearchCategoryFacetBuilder} from './controllers/commerce/search/facets/headless-search-category-facet';
export {buildSearchCategoryFacet} from './controllers/commerce/search/facets/headless-search-category-facet';
export {buildSearchDateFacet} from './controllers/commerce/search/facets/headless-search-date-facet';
export {buildSearchNumericFacet} from './controllers/commerce/search/facets/headless-search-numeric-facet';
export type {FacetGenerator} from './controllers/commerce/core/facets/generator/headless-commerce-facet-generator';
export {buildFacetGenerator} from './controllers/commerce/core/facets/generator/headless-commerce-facet-generator';
export {buildSearchRegularFacet} from './controllers/commerce/search/facets/headless-search-regular-facet';
export type {ProductListingCategoryFacetBuilder} from './controllers/commerce/product-listing/facets/headless-product-listing-category-facet';
export {buildProductListingCategoryFacet} from './controllers/commerce/product-listing/facets/headless-product-listing-category-facet';
export {buildProductListingDateFacet} from './controllers/commerce/product-listing/facets/headless-product-listing-date-facet';
export {buildProductListingNumericFacet} from './controllers/commerce/product-listing/facets/headless-product-listing-numeric-facet';
export {buildProductListingRegularFacet} from './controllers/commerce/product-listing/facets/headless-product-listing-regular-facet';

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

export type {
  Search,
  SearchState,
} from './controllers/commerce/search/headless-search';
export {buildSearch} from './controllers/commerce/search/headless-search';
export {buildSearchParameterManager} from './controllers/commerce/search/parameter-manager/headless-search-parameter-manager';

export {updateQuery} from './features/commerce/query/query-actions';

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

export {buildInstantProducts} from './controllers/commerce/instant-products/headless-instant-products';
export type {
  InstantProducts,
  InstantProductsState,
} from './controllers/commerce/instant-products/headless-instant-products';
export {buildStandaloneSearchBox} from './controllers/commerce/standalone-search-box/headless-standalone-search-box';
export type {
  StandaloneSearchBox,
  StandaloneSearchBoxState,
} from './controllers/commerce/standalone-search-box/headless-standalone-search-box';

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
export {buildProductListingBreadcrumbManager} from './controllers/commerce/product-listing/breadcrumb-manager/headless-product-listing-breadcrumb-manager';
export {buildSearchBreadcrumbManager} from './controllers/commerce/search/breadcrumb-manager/headless-search-breadcrumb-manager';

export {getOrganizationEndpoints} from './api/platform-client';
export {ProductTemplatesHelpers} from './features/commerce/product-templates/product-templates-helpers';
