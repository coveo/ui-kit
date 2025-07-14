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
// Main App
export type {CommerceEngineOptions} from './app/commerce-engine/commerce-engine.js';
export type {CommerceEngineDefinition} from './app/commerce-engine/commerce-engine.ssr.js';
export {defineCommerceEngine} from './app/commerce-engine/commerce-engine.ssr.js';
export type {CommerceEngineConfiguration} from './app/commerce-engine/commerce-engine-configuration.js';
export {getSampleCommerceEngineConfiguration} from './app/commerce-engine/commerce-engine-configuration.js';
export type {
  CommerceEngineDefinitionOptions,
  SSRCommerceEngine as CommerceEngine,
} from './app/commerce-ssr-engine/factories/build-factory.js';
export type {
  ControllerDefinition,
  ControllerDefinitionsMap,
  ControllerWithKind,
  EngineDefinitionBuildResult,
  EngineDefinitionControllersPropsOption,
  EngineStaticState,
  HydratedState,
  InferControllerFromDefinition,
  InferControllerPropsMapFromDefinitions,
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromControllers,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  InferControllersMapFromDefinition,
  OptionsTuple,
} from './app/commerce-ssr-engine/types/common.js';
export {SolutionType} from './app/commerce-ssr-engine/types/common.js';
export type {
  Build,
  BuildOptions,
  EngineDefinition,
  FetchStaticState,
  FetchStaticStateOptions,
  FromBuildResult,
  FromBuildResultOptions,
  HydrateStaticState,
  HydrateStaticStateOptions,
  InferBuildResult,
  InferHydratedState,
  InferStaticState,
} from './app/commerce-ssr-engine/types/core-engine.js';
export {Kind} from './app/commerce-ssr-engine/types/kind.js';
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
  Cart,
  CartBuildProps,
  CartDefinition,
  CartInitialState,
  CartItem,
  CartProps,
  CartState,
} from './controllers/commerce/context/cart/headless-cart.ssr.js';
export {defineCart} from './controllers/commerce/context/cart/headless-cart.ssr.js';
export type {
  Context,
  ContextDefinition,
  ContextOptions,
  ContextProps,
  ContextState,
  UserLocation,
  View,
} from './controllers/commerce/context/headless-context.ssr.js';
export {defineContext} from './controllers/commerce/context/headless-context.ssr.js';
export type {
  BreadcrumbManager,
  BreadcrumbManagerState,
} from './controllers/commerce/core/breadcrumb-manager/headless-core-breadcrumb-manager.ssr.js';
export {defineBreadcrumbManager} from './controllers/commerce/core/breadcrumb-manager/headless-core-breadcrumb-manager.ssr.js';
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
} from './controllers/commerce/core/facets/generator/headless-commerce-facet-generator.ssr.js';
export {defineFacetGenerator} from './controllers/commerce/core/facets/generator/headless-commerce-facet-generator.ssr.js';
export type {
  InteractiveProduct,
  InteractiveProductOptions,
  InteractiveProductProps,
} from './controllers/commerce/core/interactive-product/headless-core-interactive-product.js';
export type {
  CorePaginationOptions,
  Pagination,
  PaginationOptions,
  PaginationProps,
  PaginationState,
} from './controllers/commerce/core/pagination/headless-core-commerce-pagination.ssr.js';
export {definePagination} from './controllers/commerce/core/pagination/headless-core-commerce-pagination.ssr.js';
export type {
  CommerceSearchParameters,
  ParameterManager,
  ParameterManagerProps,
  ParameterManagerState,
  Parameters,
  ProductListingParameters,
  SSRParameterManagerProps,
} from './controllers/commerce/core/parameter-manager/headless-core-parameter-manager.ssr.js';
export {defineParameterManager} from './controllers/commerce/core/parameter-manager/headless-core-parameter-manager.ssr.js';
export type {
  Sort,
  SortProps,
  SortState,
} from './controllers/commerce/core/sort/headless-core-commerce-sort.ssr.js';
export {defineSort} from './controllers/commerce/core/sort/headless-core-commerce-sort.ssr.js';
export type {
  ProductListingSummaryState,
  RecommendationsSummaryState,
  SearchSummaryState,
  Summary,
  SummaryState,
} from './controllers/commerce/core/summary/headless-core-summary.ssr.js';
export {defineSummary} from './controllers/commerce/core/summary/headless-core-summary.ssr.js';
export type {
  CategoryFilterSuggestions,
  CategoryFilterSuggestionsState,
  FieldSuggestionsFacet,
  FilterSuggestions,
  FilterSuggestionsGenerator,
  FilterSuggestionsGeneratorDefinition,
  FilterSuggestionsState,
  GeneratedFilterSuggestionsControllers,
} from './controllers/commerce/filter-suggestions/headless-filter-suggestions-generator.ssr.js';
export {defineFilterSuggestionsGenerator} from './controllers/commerce/filter-suggestions/headless-filter-suggestions-generator.ssr.js';
export type {
  InstantProducts,
  InstantProductsDefinition,
  InstantProductsOptions,
  InstantProductsProps,
  InstantProductsState,
} from './controllers/commerce/instant-products/headless-instant-products.ssr.js';
export {defineInstantProducts} from './controllers/commerce/instant-products/headless-instant-products.ssr.js';
export type {
  ProductList,
  ProductListing,
  ProductListState,
  Search,
} from './controllers/commerce/product-list/headless-product-list.ssr.js';
export {defineProductList} from './controllers/commerce/product-list/headless-product-list.ssr.js';
export type {ProductView} from './controllers/commerce/product-view/headless-product-view.ssr.js';
export {defineProductView} from './controllers/commerce/product-view/headless-product-view.ssr.js';
export type {
  RecentQueriesList,
  RecentQueriesListDefinition,
  RecentQueriesListInitialState,
  RecentQueriesListOptions,
  RecentQueriesListProps,
  RecentQueriesState,
} from './controllers/commerce/recent-queries-list/headless-recent-queries-list.ssr.js';
export {defineRecentQueriesList} from './controllers/commerce/recent-queries-list/headless-recent-queries-list.ssr.js';
export type {
  Recommendations,
  RecommendationsDefinition,
  RecommendationsState,
} from './controllers/commerce/recommendations/headless-recommendations.ssr.js';
export {defineRecommendations} from './controllers/commerce/recommendations/headless-recommendations.ssr.js';
export type {
  DidYouMean,
  DidYouMeanState,
} from './controllers/commerce/search/did-you-mean/headless-did-you-mean.ssr.js';
export {defineDidYouMean} from './controllers/commerce/search/did-you-mean/headless-did-you-mean.ssr.js';
export type {
  CoreSearchBox,
  SearchBox,
  SearchBoxDefinition,
  SearchBoxOptions,
  SearchBoxProps,
  SearchBoxState,
  Suggestion,
} from './controllers/commerce/search-box/headless-search-box.ssr.js';
export {defineSearchBox} from './controllers/commerce/search-box/headless-search-box.ssr.js';
export type {
  StandaloneSearchBox,
  StandaloneSearchBoxDefinition,
  StandaloneSearchBoxProps,
  StandaloneSearchBoxState,
} from './controllers/commerce/standalone-search-box/headless-standalone-search-box.ssr.js';
export {defineStandaloneSearchBox} from './controllers/commerce/standalone-search-box/headless-standalone-search-box.ssr.js';
export type {
  NotifyTrigger,
  NotifyTriggerDefinition,
  NotifyTriggerState,
} from './controllers/commerce/triggers/headless-notify-trigger.ssr.js';
export {defineNotifyTrigger} from './controllers/commerce/triggers/headless-notify-trigger.ssr.js';
export type {
  QueryTrigger,
  QueryTriggerDefinition,
  QueryTriggerState,
} from './controllers/commerce/triggers/headless-query-trigger.ssr.js';
export {defineQueryTrigger} from './controllers/commerce/triggers/headless-query-trigger.ssr.js';
export type {
  RedirectionTrigger,
  RedirectionTriggerDefinition,
  RedirectionTriggerState,
} from './controllers/commerce/triggers/headless-redirection-trigger.ssr.js';
export {defineRedirectionTrigger} from './controllers/commerce/triggers/headless-redirection-trigger.ssr.js';
//#region Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller.js';
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
