/**
 * The Coveo Headless SSR Commerce sub-package exposes exposes the engine, definers, controllers, actions, and utility functions to build a server side rendered commerce experience.
 *
 * @example
 * ```typescript
 * import {
 *   Controller,
 *   ControllerDefinitionsMap,
 *   CommerceEngineDefinitionOptions,
 *   CommerceEngine,
 *   defineCommerceEngine,
 *   InferStaticState,
 *   InferHydratedState,
 *   defineProductList,
 *   getSampleCommerceEngineConfiguration,
 * } from '@coveo/headless/ssr-commerce';
 *
 * type CommerceEngineConfig = CommerceEngineDefinitionOptions<
 *   ControllerDefinitionsMap<CommerceEngine, Controller>
 * >;
 *
 * const config = {
 *   configuration: {
 *     ...getSampleCommerceEngineConfiguration(),
 *     context: {
 *       language: 'en',
 *       country: 'US',
 *       currency: 'USD',
 *       view: {
 *         url: '...',
 *       },
 *     },
 *   },
 *   controllers: {
 *     productList: defineProductList(),
 *   },
 * } satisfies CommerceEngineConfig;
 *
 * const engineDefinition = defineCommerceEngine(engineConfig);
 *
 * export const {
 *   listingEngineDefinition,
 *   searchEngineDefinition,
 *   standaloneEngineDefinition,
 * } = engineDefinition;
 *
 * await listingEngineDefinition.fetchStaticState({
 *   navigatorContextProvider: () => {/*...* /},
 *   context: {/*...* /},
 * });
 *
 * export type ListingStaticState = InferStaticState<
 *   typeof listingEngineDefinition
 * >;
 * export type ListingHydratedState = InferHydratedState<
 *   typeof listingEngineDefinition
 * >;
 *
 * export type SearchStaticState = InferStaticState<typeof searchEngineDefinition>;
 * export type SearchHydratedState = InferHydratedState<
 *   typeof searchEngineDefinition
 * >;
 *
 * export type StandaloneStaticState = InferStaticState<
 *   typeof standaloneEngineDefinition
 * >;
 * export type StandaloneHydratedState = InferHydratedState<
 *   typeof standaloneEngineDefinition
 * >;
 *
 * ```
 * @module SSR Commerce
 */

export type {Relay} from '@coveo/relay';

export type {Middleware, Unsubscribe} from '@reduxjs/toolkit';
export type {CommerceEngineConfiguration} from './app/commerce-engine/commerce-engine-configuration.js';
export {getSampleCommerceEngineConfiguration} from './app/commerce-engine/commerce-engine-configuration.js';
// export type
export type {CoreEngineNext, ExternalEngineOptions} from './app/engine.js';
export type {
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
  EngineConfiguration,
} from './app/engine-configuration.js';
export type {LoggerOptions, LogLevel} from './app/logger.js';
export type {
  BrowserNavigatorContextProvider,
  NavigatorContext,
  NavigatorContextProvider,
} from './app/navigator-context-provider.js';
export type {
  InteractiveProduct,
  InteractiveProductOptions,
  InteractiveProductProps,
} from './controllers/commerce/core/interactive-product/headless-core-interactive-product.js';
//#region Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller.js';
export type {
  BreadcrumbManager,
  BreadcrumbManagerDefinition,
  BreadcrumbManagerState,
} from './ssr-next/commerce/controllers/breadcrumb-manager/headless-core-breadcrumb-manager.ssr.js';
export {defineBreadcrumbManager} from './ssr-next/commerce/controllers/breadcrumb-manager/headless-core-breadcrumb-manager.ssr.js';
export type {
  Cart,
  CartBuildProps,
  CartDefinition,
  CartInitialState,
  CartItem,
  CartProps,
  CartState,
} from './ssr-next/commerce/controllers/cart/headless-cart.ssr.js';
export {defineCart} from './ssr-next/commerce/controllers/cart/headless-cart.ssr.js';
export type {
  Context,
  ContextDefinition,
  ContextOptions,
  ContextProps,
  ContextState,
  UserLocation,
  View,
} from './ssr-next/commerce/controllers/context/headless-context.ssr.js';
export {defineContext} from './ssr-next/commerce/controllers/context/headless-context.ssr.js';
export type {
  DidYouMean,
  DidYouMeanDefinition,
  DidYouMeanState,
} from './ssr-next/commerce/controllers/did-you-mean/headless-did-you-mean.ssr.js';
export {defineDidYouMean} from './ssr-next/commerce/controllers/did-you-mean/headless-did-you-mean.ssr.js';
export type {
  CategoryFilterSuggestions,
  CategoryFilterSuggestionsState,
  FieldSuggestionsFacet,
  FilterSuggestions,
  FilterSuggestionsGenerator,
  FilterSuggestionsGeneratorDefinition,
  FilterSuggestionsState,
  GeneratedFilterSuggestionsControllers,
} from './ssr-next/commerce/controllers/filter-suggestions/headless-filter-suggestions-generator.ssr.js';
export {defineFilterSuggestionsGenerator} from './ssr-next/commerce/controllers/filter-suggestions/headless-filter-suggestions-generator.ssr.js';
export type {
  BaseFacetSearchResult,
  CategoryFacet,
  CategoryFacetSearchResult,
  CategoryFacetState,
  CategoryFacetValue,
  CoreCommerceFacet,
  DateFacet,
  DateFacetState,
  DateFacetValue,
  FacetGenerator,
  FacetGeneratorDefinition,
  FacetGeneratorState,
  FacetType,
  LocationFacet,
  LocationFacetState,
  LocationFacetValue,
  MappedFacetState,
  MappedFacetStates,
  MappedGeneratedFacetController,
  NumericFacet,
  NumericFacetState,
  NumericFacetValue,
  RegularFacet,
  RegularFacetState,
  RegularFacetValue,
} from './ssr-next/commerce/controllers/generator/headless-commerce-facet-generator.ssr.js';
export {defineFacetGenerator} from './ssr-next/commerce/controllers/generator/headless-commerce-facet-generator.ssr.js';
export type {
  InstantProducts,
  InstantProductsDefinition,
  InstantProductsOptions,
  InstantProductsProps,
  InstantProductsState,
} from './ssr-next/commerce/controllers/instant-products/headless-instant-products.ssr.js';
export {defineInstantProducts} from './ssr-next/commerce/controllers/instant-products/headless-instant-products.ssr.js';
export type {
  CorePaginationOptions,
  Pagination,
  PaginationDefinition,
  PaginationOptions,
  PaginationProps,
  PaginationState,
} from './ssr-next/commerce/controllers/pagination/headless-core-commerce-pagination.ssr.js';
export {definePagination} from './ssr-next/commerce/controllers/pagination/headless-core-commerce-pagination.ssr.js';
export type {
  CommerceSearchParameters,
  ParameterManager,
  ParameterManagerDefinition,
  ParameterManagerProps,
  ParameterManagerState,
  Parameters,
  ProductListingParameters,
  SSRParameterManagerProps,
} from './ssr-next/commerce/controllers/parameter-manager/headless-core-parameter-manager.ssr.js';
export {defineParameterManager} from './ssr-next/commerce/controllers/parameter-manager/headless-core-parameter-manager.ssr.js';
export type {
  ProductList,
  ProductListDefinition,
  ProductListing,
  ProductListState,
  Search,
} from './ssr-next/commerce/controllers/product-list/headless-product-list.ssr.js';
export {defineProductList} from './ssr-next/commerce/controllers/product-list/headless-product-list.ssr.js';
export type {
  ProductView,
  ProductViewDefinition,
} from './ssr-next/commerce/controllers/product-view/headless-product-view.ssr.js';
export {defineProductView} from './ssr-next/commerce/controllers/product-view/headless-product-view.ssr.js';
export type {
  RecentQueriesList,
  RecentQueriesListDefinition,
  RecentQueriesListInitialState,
  RecentQueriesListOptions,
  RecentQueriesListProps,
  RecentQueriesState,
} from './ssr-next/commerce/controllers/recent-queries-list/headless-recent-queries-list.ssr.js';
export {defineRecentQueriesList} from './ssr-next/commerce/controllers/recent-queries-list/headless-recent-queries-list.ssr.js';
export type {
  Recommendations,
  RecommendationsDefinition,
  RecommendationsState,
} from './ssr-next/commerce/controllers/recommendations/headless-recommendations.ssr.js';
export {defineRecommendations} from './ssr-next/commerce/controllers/recommendations/headless-recommendations.ssr.js';
export type {
  CoreSearchBox,
  SearchBox,
  SearchBoxDefinition,
  SearchBoxOptions,
  SearchBoxProps,
  SearchBoxState,
  Suggestion,
} from './ssr-next/commerce/controllers/search-box/headless-search-box.ssr.js';
export {defineSearchBox} from './ssr-next/commerce/controllers/search-box/headless-search-box.ssr.js';
export type {
  Sort,
  SortDefinition,
  SortProps,
  SortState,
} from './ssr-next/commerce/controllers/sort/headless-core-commerce-sort.ssr.js';
export {defineSort} from './ssr-next/commerce/controllers/sort/headless-core-commerce-sort.ssr.js';
export type {
  StandaloneSearchBox,
  StandaloneSearchBoxDefinition,
  StandaloneSearchBoxProps,
  StandaloneSearchBoxState,
} from './ssr-next/commerce/controllers/standalone-search-box/headless-standalone-search-box.ssr.js';
export {defineStandaloneSearchBox} from './ssr-next/commerce/controllers/standalone-search-box/headless-standalone-search-box.ssr.js';
export type {
  ProductListingSummaryState,
  RecommendationsSummaryState,
  SearchSummaryState,
  Summary,
  SummaryDefinition,
  SummaryState,
} from './ssr-next/commerce/controllers/summary/headless-core-summary.ssr.js';
export {defineSummary} from './ssr-next/commerce/controllers/summary/headless-core-summary.ssr.js';
export type {
  NotifyTrigger,
  NotifyTriggerDefinition,
  NotifyTriggerState,
} from './ssr-next/commerce/controllers/triggers/headless-notify-trigger.ssr.js';
export {defineNotifyTrigger} from './ssr-next/commerce/controllers/triggers/headless-notify-trigger.ssr.js';
export type {
  QueryTrigger,
  QueryTriggerDefinition,
  QueryTriggerState,
} from './ssr-next/commerce/controllers/triggers/headless-query-trigger.ssr.js';
export {defineQueryTrigger} from './ssr-next/commerce/controllers/triggers/headless-query-trigger.ssr.js';
export type {
  RedirectionTrigger,
  RedirectionTriggerDefinition,
  RedirectionTriggerState,
} from './ssr-next/commerce/controllers/triggers/headless-redirection-trigger.ssr.js';
export {defineRedirectionTrigger} from './ssr-next/commerce/controllers/triggers/headless-redirection-trigger.ssr.js';
export {defineCommerceEngine} from './ssr-next/commerce/engine/commerce-engine.ssr.js';
export type {SSRCommerceEngine as CommerceEngine} from './ssr-next/commerce/factories/build-factory.js';
// Main App
export type {
  BuildConfig,
  SSRCommerceEngineOptions as CommerceEngineOptions,
} from './ssr-next/commerce/types/build.js';
export {SolutionType} from './ssr-next/commerce/types/controller-constants.js';
export type {
  AugmentedControllerDefinition,
  CommerceEngineDefinitionControllersPropsOption as EngineDefinitionControllersPropsOption,
  ControllerDefinition,
  ControllerDefinitionsMap,
  HydratedState,
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromControllers,
} from './ssr-next/commerce/types/controller-definitions.js';
export type {
  InferControllerFromDefinition,
  InferControllerPropsMapFromDefinitions,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  InferControllersMapFromDefinition,
  InferHydratedState,
  InferStaticState,
} from './ssr-next/commerce/types/controller-inference.js';
export type {
  CommerceEngineDefinition,
  CommerceEngineDefinitionBuildResult,
  CommerceEngineDefinitionOptions,
  EngineStaticState,
  FetchStaticState,
  HydrateStaticState,
  HydrateStaticStateOptions,
} from './ssr-next/commerce/types/engine.js';
// State
export type {
  CommerceAppState,
  CommerceProductListingParametersState,
  CommerceSearchParametersState,
} from './state/commerce-app-state.js';

// TODO: KIT-3391 - export other SSR commerce controllers

//#endregion

export * from './features/commerce/configuration/configuration-actions-loader.js';
export * from './features/commerce/context/cart/cart-actions-loader.js';
//#region Grouped actions
export * from './features/commerce/context/context-actions-loader.js';
export * from './features/commerce/facets/category-facet/category-facet-actions-loader.js';
export * from './features/commerce/facets/core-facet/core-facet-actions-loader.js';
export * from './features/commerce/facets/date-facet/date-facet-actions-loader.js';
export * from './features/commerce/facets/numeric-facet/numeric-facet-actions-loader.js';
export * from './features/commerce/facets/regular-facet/regular-facet-actions-loader.js';
export * from './features/commerce/instant-products/instant-products-actions-loader.js';
export * from './features/commerce/pagination/pagination-actions-loader.js';
export * from './features/commerce/product/product-actions-loaders.js';
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
export {buildResultTemplatesManager} from './features/result-templates/result-templates-manager.js';

//#endregion

export {getCommerceApiBaseUrl} from './api/commerce/commerce-api-client.js';
// Types & Helpers
// TODO KIT-3462: add export commerce SSR parameter serializer
export type {
  BaseProduct,
  ChildProduct,
  Product,
} from './api/commerce/common/product.js';
export {
  getAnalyticsNextApiBaseUrl,
  getOrganizationEndpoint,
} from './api/platform-client.js';
export type {
  RelativeDate,
  RelativeDatePeriod,
  RelativeDateUnit,
} from './api/search/date/relative-date.js';
export {
  deserializeRelativeDate,
  validateRelativeDate,
} from './api/search/date/relative-date.js';
export {buildParameterSerializer} from './features/commerce/parameters/parameters-serializer.ssr.js';
export {ProductTemplatesHelpers} from './features/commerce/product-templates/product-templates-helpers.js';
export type {
  ProductTemplate,
  ProductTemplateCondition,
  ProductTemplatesManager,
} from './features/commerce/product-templates/product-templates-manager.js';
export type {SortCriterion} from './features/commerce/sort/sort.js';
export {SortBy} from './features/commerce/sort/sort.js';
export type {
  SortByDate,
  SortByField,
  SortByNoSort,
  SortByQRE,
  SortByRelevancy,
} from './features/sort-criteria/criteria.js';
export {
  buildCriterionExpression,
  buildDateSortCriterion,
  buildFieldSortCriterion,
  buildNoSortCriterion,
  buildQueryRankingExpressionSortCriterion,
  buildRelevanceSortCriterion,
  SortOrder,
} from './features/sort-criteria/criteria.js';
export {parseCriterionExpression} from './features/sort-criteria/criteria-parser.js';
export type {Template} from './features/templates/templates-manager.js';
export type {HighlightKeyword} from './utils/highlight.js';
export * from './utils/query-expression/query-expression.js';
export type {PlatformEnvironment} from './utils/url-utils.js';
export {VERSION} from './utils/version.js';
