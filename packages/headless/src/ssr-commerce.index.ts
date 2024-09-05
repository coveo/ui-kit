export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';
export type {Relay} from '@coveo/relay';

// Main App
export type {CommerceEngineOptions} from './app/commerce-engine/commerce-engine';
export type {CommerceEngineConfiguration} from './app/commerce-engine/commerce-engine-configuration';
export type {
  SSRCommerceEngine as CommerceEngine,
  CommerceEngineDefinition,
  CommerceEngineDefinitionOptions,
} from './app/commerce-engine/commerce-engine.ssr';
export {defineCommerceEngine} from './app/commerce-engine/commerce-engine.ssr';
export {getSampleCommerceEngineConfiguration} from './app/commerce-engine/commerce-engine-configuration';

// export type
export type {CoreEngineNext, ExternalEngineOptions} from './app/engine';
export type {
  EngineConfiguration,
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
} from './app/engine-configuration';
export type {
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  InferControllersMapFromDefinition,
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromControllers,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
} from './app/commerce-ssr-engine/types/common';
export type {Build} from './app/ssr-engine/types/build';
export type {
  EngineDefinition,
  InferStaticState,
  InferHydratedState,
  InferBuildResult,
} from './app/commerce-ssr-engine/types/core-engine';
export type {LoggerOptions} from './app/logger';
export type {NavigatorContext} from './app/navigatorContextProvider';

export type {LogLevel} from './app/logger';

// State
export type {
  CommerceSearchParametersState,
  CommerceProductListingParametersState,
  CommerceAppState,
} from './state/commerce-app-state';

//#region Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller';

export type {
  DidYouMean,
  DidYouMeanState,
} from './controllers/commerce/search/did-you-mean/headless-did-you-mean.ssr';
export {defineDidYouMean} from './controllers/commerce/search/did-you-mean/headless-did-you-mean.ssr';

export type {
  BaseFacetSearchResult,
  CategoryFacet,
  CategoryFacetState,
  CategoryFacetValue,
  CategoryFacetSearchResult,
  DateFacet,
  DateFacetState,
  FacetGenerator,
  FacetGeneratorState,
  NumericFacet,
  NumericFacetState,
  RegularFacet,
  RegularFacetState,
  RegularFacetValue,
} from './controllers/commerce/core/facets/generator/headless-commerce-facet-generator.ssr';
export {defineFacetGenerator} from './controllers/commerce/core/facets/generator/headless-commerce-facet-generator.ssr';

export type {
  Pagination,
  PaginationProps,
  PaginationState,
} from './controllers/commerce/core/pagination/headless-core-commerce-pagination.ssr';
export {definePagination} from './controllers/commerce/core/pagination/headless-core-commerce-pagination.ssr';

export type {
  ParameterManager,
  ParameterManagerProps,
  ParameterManagerState,
  Parameters,
  ProductListingParameters,
  CommerceSearchParameters,
} from './controllers/commerce/core/parameter-manager/headless-core-parameter-manager.ssr';
export {defineParameterManager} from './controllers/commerce/core/parameter-manager/headless-core-parameter-manager.ssr';

export type {
  ProductList,
  ProductListState,
} from './controllers/commerce/product-listing/headless-product-listing.ssr';
export {defineProductList} from './controllers/commerce/product-listing/headless-product-listing.ssr';

export type {ProductView} from './controllers/commerce/product-view/headless-product-view.ssr';
export {defineProductView} from './controllers/commerce/product-view/headless-product-view.ssr';

export type {
  RecommendationsState,
  Recommendations,
} from './controllers/commerce/recommendations/headless-recommendations.ssr';
export {defineRecommendations} from './controllers/commerce/recommendations/headless-recommendations.ssr';

export type {
  Cart,
  CartInitialState,
  CartItem,
  CartProps,
  CartState,
  CartDefinition,
} from './controllers/commerce/context/cart/headless-cart.ssr';
export {defineCart} from './controllers/commerce/context/cart/headless-cart.ssr';

export type {
  Context,
  ContextOptions,
  ContextProps,
  ContextState,
  View,
  ContextDefinition,
} from './controllers/commerce/context/headless-context.ssr';
export {defineContext} from './controllers/commerce/context/headless-context.ssr';

export type {
  SearchBox,
  SearchBoxOptions,
  SearchBoxProps,
  SearchBoxState,
  Suggestion,
  SearchBoxDefinition,
} from './controllers/commerce/search-box/headless-search-box.ssr';
export {defineSearchBox} from './controllers/commerce/search-box/headless-search-box.ssr';

export type {
  Sort,
  SortProps,
  SortState,
} from './controllers/commerce/core/sort/headless-core-commerce-sort.ssr';
export {defineSort} from './controllers/commerce/core/sort/headless-core-commerce-sort.ssr';

export type {
  Summary,
  ProductListingSummaryState,
  RecommendationsSummaryState,
  SearchSummaryState,
  SummaryState,
} from './controllers/commerce/core/summary/headless-core-summary.ssr';
export {defineSummary} from './controllers/commerce/core/summary/headless-core-summary.ssr';

export type {
  RecentQueriesList,
  RecentQueriesListOptions,
  RecentQueriesListProps,
  RecentQueriesListInitialState,
  RecentQueriesState,
  RecentQueriesListDefinition,
} from './controllers/commerce/recent-queries-list/headless-recent-queries-list.ssr';
export {defineRecentQueriesList} from './controllers/commerce/recent-queries-list/headless-recent-queries-list.ssr';

export type {
  FieldSuggestions,
  FieldSuggestionsState,
  CategoryFieldSuggestions,
  CategoryFieldSuggestionsState,
  FieldSuggestionsFacet,
  GeneratedFieldSuggestionsControllers,
  FieldSuggestionsGenerator,
  FieldSuggestionsGeneratorDefinition,
} from './controllers/commerce/field-suggestions/headless-field-suggestions-generator.ssr';
export {defineFieldSuggestionsGenerator} from './controllers/commerce/field-suggestions/headless-field-suggestions-generator.ssr';

export type {
  NotifyTrigger,
  NotifyTriggerState,
  NotifyTriggerDefinition,
} from './controllers/commerce/triggers/headless-notify-trigger.ssr';
export {defineNotifyTrigger} from './controllers/commerce/triggers/headless-notify-trigger.ssr';

export type {
  QueryTrigger,
  QueryTriggerState,
  QueryTriggerDefinition,
} from './controllers/commerce/triggers/headless-query-trigger.ssr';
export {defineQueryTrigger} from './controllers/commerce/triggers/headless-query-trigger.ssr';

export type {
  RedirectionTrigger,
  RedirectionTriggerState,
  RedirectionTriggerDefinition,
} from './controllers/commerce/triggers/headless-redirection-trigger.ssr';
export {defineRedirectionTrigger} from './controllers/commerce/triggers/headless-redirection-trigger.ssr';

export type {
  StandaloneSearchBox,
  StandaloneSearchBoxProps,
  StandaloneSearchBoxState,
  StandaloneSearchBoxDefinition,
} from './controllers/commerce/standalone-search-box/headless-standalone-search-box.ssr';
export {defineStandaloneSearchBox} from './controllers/commerce/standalone-search-box/headless-standalone-search-box.ssr';

export type {
  InstantProducts,
  InstantProductsOptions,
  InstantProductsState,
  InstantProductsProps,
  InstantProductsDefinition,
} from './controllers/commerce/instant-products/headless-instant-products.ssr';
export {defineInstantProducts} from './controllers/commerce/instant-products/headless-instant-products.ssr';
// TODO: KIT-3391 - export other SSR commerce controllers

//#endregion

//#region Grouped actions
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
export {buildResultTemplatesManager} from './features/result-templates/result-templates-manager';
//#endregion

// Types & Helpers
// TODO KIT-3462: add export commerce SSR parameter serializer
export type {
  BaseProduct,
  Product,
  ChildProduct,
} from './api/commerce/common/product';
export type {
  SortCriterion,
  SortByDate,
  SortByField,
  SortByNoSort,
  SortByQRE,
  SortByRelevancy,
} from './features/sort-criteria/criteria';
export {
  SortBy,
  SortOrder,
  buildDateSortCriterion,
  buildCriterionExpression,
  buildFieldSortCriterion,
  buildNoSortCriterion,
  buildQueryRankingExpressionSortCriterion,
  buildRelevanceSortCriterion,
} from './features/sort-criteria/criteria';
export {parseCriterionExpression} from './features/sort-criteria/criteria-parser';
export type {Template} from './features/templates/templates-manager';
export type {
  ProductTemplate,
  ProductTemplateCondition,
  ProductTemplatesManager,
} from './features/commerce/product-templates/product-templates-manager';
export {ProductTemplatesHelpers} from './features/commerce/product-templates/product-templates-helpers';

export {
  platformUrl,
  analyticsUrl,
  getOrganizationEndpoints,
} from './api/platform-client';
export type {PlatformEnvironment} from './utils/url-utils';

export {buildSearchParameterSerializer} from './features/search-parameters/search-parameter-serializer';
export type {HighlightKeyword} from './utils/highlight';
export {VERSION} from './utils/version';
export type {
  RelativeDate,
  RelativeDatePeriod,
  RelativeDateUnit,
} from './api/search/date/relative-date';
export {
  deserializeRelativeDate,
  validateRelativeDate,
} from './api/search/date/relative-date';

export * from './utils/query-expression/query-expression';
