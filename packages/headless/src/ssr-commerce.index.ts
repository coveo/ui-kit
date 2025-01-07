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

export type {
  CommerceEngineDefinitionOptions,
  SSRCommerceEngine as CommerceEngine,
} from './app/commerce-ssr-engine/factories/build-factory.js';

export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';
export type {Relay} from '@coveo/relay';

// Main App
export type {CommerceEngineOptions} from './app/commerce-engine/commerce-engine.js';
export type {CommerceEngineConfiguration} from './app/commerce-engine/commerce-engine-configuration.js';
export type {CommerceEngineDefinition} from './app/commerce-engine/commerce-engine.ssr.js';
export {defineCommerceEngine} from './app/commerce-engine/commerce-engine.ssr.js';
export {getSampleCommerceEngineConfiguration} from './app/commerce-engine/commerce-engine-configuration.js';

// export type
export type {CoreEngineNext, ExternalEngineOptions} from './app/engine.js';
export type {
  EngineConfiguration,
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
} from './app/engine-configuration.js';
export {SolutionType} from './app/commerce-ssr-engine/types/common.js';
export type {
  ControllerDefinition,
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  InferControllersMapFromDefinition,
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromControllers,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  InferControllerPropsMapFromDefinitions,
  EngineStaticState,
  EngineDefinitionBuildResult,
  EngineDefinitionControllersPropsOption,
  HydratedState,
  OptionsTuple,
  ControllerWithKind,
} from './app/commerce-ssr-engine/types/common.js';
export {Kind} from './app/commerce-ssr-engine/types/kind.js';
export type {
  EngineDefinition,
  InferStaticState,
  InferHydratedState,
  InferBuildResult,
  HydrateStaticState,
  FetchStaticState,
  FetchStaticStateOptions,
  HydrateStaticStateOptions,
  Build,
  BuildOptions,
  FromBuildResult,
  FromBuildResultOptions,
} from './app/commerce-ssr-engine/types/core-engine.js';
export type {LoggerOptions} from './app/logger.js';
export type {
  NavigatorContext,
  BrowserNavigatorContextProvider,
  NavigatorContextProvider,
} from './app/navigatorContextProvider.js';

export type {LogLevel} from './app/logger.js';

// State
export type {
  CommerceSearchParametersState,
  CommerceProductListingParametersState,
  CommerceAppState,
} from './state/commerce-app-state.js';

//#region Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller.js';

export type {
  DidYouMean,
  DidYouMeanState,
} from './controllers/commerce/search/did-you-mean/headless-did-you-mean.ssr.js';
export {defineDidYouMean} from './controllers/commerce/search/did-you-mean/headless-did-you-mean.ssr.js';

export type {
  BaseFacetSearchResult,
  CategoryFacet,
  CategoryFacetState,
  CategoryFacetValue,
  CategoryFacetSearchResult,
  DateFacet,
  DateFacetValue,
  DateFacetState,
  FacetGenerator,
  FacetGeneratorState,
  NumericFacet,
  NumericFacetValue,
  NumericFacetState,
  RegularFacet,
  RegularFacetState,
  RegularFacetValue,
  MappedGeneratedFacetController,
  MappedFacetStates,
  MappedFacetState,
  LocationFacetValue,
  LocationFacetState,
  FacetType,
} from './controllers/commerce/core/facets/generator/headless-commerce-facet-generator.ssr.js';
export {defineFacetGenerator} from './controllers/commerce/core/facets/generator/headless-commerce-facet-generator.ssr.js';

export type {
  Pagination,
  PaginationProps,
  PaginationState,
} from './controllers/commerce/core/pagination/headless-core-commerce-pagination.ssr.js';
export {definePagination} from './controllers/commerce/core/pagination/headless-core-commerce-pagination.ssr.js';

export type {
  ParameterManager,
  ParameterManagerProps,
  SSRParameterManagerProps,
  ParameterManagerState,
  Parameters,
  ProductListingParameters,
  CommerceSearchParameters,
} from './controllers/commerce/core/parameter-manager/headless-core-parameter-manager.ssr.js';
export {defineParameterManager} from './controllers/commerce/core/parameter-manager/headless-core-parameter-manager.ssr.js';

export type {
  ProductList,
  ProductListState,
} from './controllers/commerce/product-list/headless-product-list.ssr.js';
export {defineProductList} from './controllers/commerce/product-list/headless-product-list.ssr.js';

export type {ProductView} from './controllers/commerce/product-view/headless-product-view.ssr.js';
export {defineProductView} from './controllers/commerce/product-view/headless-product-view.ssr.js';

export type {
  RecommendationsState,
  Recommendations,
} from './controllers/commerce/recommendations/headless-recommendations.ssr.js';
export {defineRecommendations} from './controllers/commerce/recommendations/headless-recommendations.ssr.js';

export type {
  Cart,
  CartInitialState,
  CartItem,
  CartProps,
  CartState,
  CartBuildProps,
  CartDefinition,
} from './controllers/commerce/context/cart/headless-cart.ssr.js';
export {defineCart} from './controllers/commerce/context/cart/headless-cart.ssr.js';

export type {
  Context,
  ContextOptions,
  ContextProps,
  ContextState,
  View,
  UserLocation,
  ContextDefinition,
} from './controllers/commerce/context/headless-context.ssr.js';
export {defineContext} from './controllers/commerce/context/headless-context.ssr.js';

export type {
  SearchBox,
  SearchBoxOptions,
  SearchBoxProps,
  SearchBoxState,
  Suggestion,
  SearchBoxDefinition,
} from './controllers/commerce/search-box/headless-search-box.ssr.js';
export {defineSearchBox} from './controllers/commerce/search-box/headless-search-box.ssr.js';

export type {
  Sort,
  SortProps,
  SortState,
} from './controllers/commerce/core/sort/headless-core-commerce-sort.ssr.js';
export {defineSort} from './controllers/commerce/core/sort/headless-core-commerce-sort.ssr.js';

export type {
  BreadcrumbManager,
  BreadcrumbManagerState,
} from './controllers/commerce/core/breadcrumb-manager/headless-core-breadcrumb-manager.ssr.js';
export {defineBreadcrumbManager} from './controllers/commerce/core/breadcrumb-manager/headless-core-breadcrumb-manager.ssr.js';

export type {
  Summary,
  ProductListingSummaryState,
  RecommendationsSummaryState,
  SearchSummaryState,
  SummaryState,
} from './controllers/commerce/core/summary/headless-core-summary.ssr.js';
export {defineSummary} from './controllers/commerce/core/summary/headless-core-summary.ssr.js';

export type {
  RecentQueriesList,
  RecentQueriesListOptions,
  RecentQueriesListProps,
  RecentQueriesListInitialState,
  RecentQueriesState,
  RecentQueriesListDefinition,
} from './controllers/commerce/recent-queries-list/headless-recent-queries-list.ssr.js';
export {defineRecentQueriesList} from './controllers/commerce/recent-queries-list/headless-recent-queries-list.ssr.js';

export type {
  FieldSuggestions,
  FieldSuggestionsState,
  CategoryFieldSuggestions,
  CategoryFieldSuggestionsState,
  FieldSuggestionsFacet,
  GeneratedFieldSuggestionsControllers,
  FieldSuggestionsGenerator,
  FieldSuggestionsGeneratorDefinition,
} from './controllers/commerce/field-suggestions/headless-field-suggestions-generator.ssr.js';
export {defineFieldSuggestionsGenerator} from './controllers/commerce/field-suggestions/headless-field-suggestions-generator.ssr.js';

export type {
  NotifyTrigger,
  NotifyTriggerState,
  NotifyTriggerDefinition,
} from './controllers/commerce/triggers/headless-notify-trigger.ssr.js';
export {defineNotifyTrigger} from './controllers/commerce/triggers/headless-notify-trigger.ssr.js';

export type {
  QueryTrigger,
  QueryTriggerState,
  QueryTriggerDefinition,
} from './controllers/commerce/triggers/headless-query-trigger.ssr.js';
export {defineQueryTrigger} from './controllers/commerce/triggers/headless-query-trigger.ssr.js';

export type {
  RedirectionTrigger,
  RedirectionTriggerState,
  RedirectionTriggerDefinition,
} from './controllers/commerce/triggers/headless-redirection-trigger.ssr.js';
export {defineRedirectionTrigger} from './controllers/commerce/triggers/headless-redirection-trigger.ssr.js';

export type {
  StandaloneSearchBox,
  StandaloneSearchBoxProps,
  StandaloneSearchBoxState,
  StandaloneSearchBoxDefinition,
} from './controllers/commerce/standalone-search-box/headless-standalone-search-box.ssr.js';
export {defineStandaloneSearchBox} from './controllers/commerce/standalone-search-box/headless-standalone-search-box.ssr.js';

export type {
  InstantProducts,
  InstantProductsOptions,
  InstantProductsState,
  InstantProductsProps,
  InstantProductsDefinition,
} from './controllers/commerce/instant-products/headless-instant-products.ssr.js';
export {defineInstantProducts} from './controllers/commerce/instant-products/headless-instant-products.ssr.js';
// TODO: KIT-3391 - export other SSR commerce controllers

//#endregion

//#region Grouped actions
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
export {buildResultTemplatesManager} from './features/result-templates/result-templates-manager.js';
//#endregion

// Types & Helpers
// TODO KIT-3462: add export commerce SSR parameter serializer
export type {
  BaseProduct,
  Product,
  ChildProduct,
} from './api/commerce/common/product.js';
export type {
  SortByDate,
  SortByField,
  SortByNoSort,
  SortByQRE,
  SortByRelevancy,
} from './features/sort-criteria/criteria.js';
export {
  SortOrder,
  buildDateSortCriterion,
  buildCriterionExpression,
  buildFieldSortCriterion,
  buildNoSortCriterion,
  buildQueryRankingExpressionSortCriterion,
  buildRelevanceSortCriterion,
} from './features/sort-criteria/criteria.js';
export type {SortCriterion} from './features/commerce/sort/sort.js';

export {SortBy} from './features/commerce/sort/sort.js';
export {parseCriterionExpression} from './features/sort-criteria/criteria-parser.js';
export type {Template} from './features/templates/templates-manager.js';
export type {
  ProductTemplate,
  ProductTemplateCondition,
  ProductTemplatesManager,
} from './features/commerce/product-templates/product-templates-manager.js';
export {ProductTemplatesHelpers} from './features/commerce/product-templates/product-templates-helpers.js';

export type {PlatformEnvironment} from './utils/url-utils.js';

export {buildParameterSerializer} from './features/commerce/parameters/parameters-serializer.ssr.js';
export type {HighlightKeyword} from './utils/highlight.js';
export {VERSION} from './utils/version.js';
export type {
  RelativeDate,
  RelativeDatePeriod,
  RelativeDateUnit,
} from './api/search/date/relative-date.js';
export {
  deserializeRelativeDate,
  validateRelativeDate,
} from './api/search/date/relative-date.js';

export {
  getOrganizationEndpoint,
  getAnalyticsNextApiBaseUrl,
} from './api/platform-client.js';

export {getCommerceApiBaseUrl} from './api/commerce/commerce-api-client.js';

export * from './utils/query-expression/query-expression.js';
