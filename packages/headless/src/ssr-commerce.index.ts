import {polyfillCryptoNode} from './api/analytics/analytics-crypto-polyfill';

polyfillCryptoNode();

// 3rd Party Libraries
export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';
export {createAction, createAsyncThunk, createReducer} from '@reduxjs/toolkit';
export type {AnalyticsClientSendEventHook} from 'coveo.analytics';
export type {Relay} from '@coveo/relay';

// Main App
export type {
  CommerceEngineOptions,
  CommerceEngineConfiguration,
} from './app/commerce-engine/commerce-engine';
export type {
  SSRCommerceEngine as CommerceEngine,
  CommerceEngineDefinition,
  CommerceEngineDefinitionOptions,
} from './app/commerce-engine/commerce-engine.ssr';
export {defineCommerceEngine} from './app/commerce-engine/commerce-engine.ssr';
export {getSampleCommerceEngineConfiguration} from './app/commerce-engine/commerce-engine-configuration';

// export type
export type {CoreEngine, ExternalEngineOptions} from './app/engine';
export type {
  EngineConfiguration,
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
} from './app/engine-configuration';
export type {
  ControllerDefinitionWithoutProps,
  ControllerDefinitionWithProps,
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  InferControllersMapFromDefinition,
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromControllers,
  InferControllerStaticStateMapFromDefinitions,
} from './app/ssr-engine/types/common';
export type {Build} from './app/ssr-engine/types/build';
export type {
  EngineDefinition,
  InferStaticState,
  InferHydratedState,
  InferBuildResult,
} from './app/ssr-engine/types/core-engine';
export type {LoggerOptions} from './app/logger';
export type {NavigatorContext} from './app/navigatorContextProvider';

export type {LogLevel} from './app/logger';

// State
export type {
  SearchParametersState,
  SearchAppState,
} from './state/search-app-state';

//#region Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller';

export type {CategoryFacet} from './controllers/commerce/core/facets/category/headless-commerce-category-facet';
export type {
  DateFacet,
  DateFacetState,
} from './controllers/commerce/core/facets/date/headless-commerce-date-facet';
export type {RegularFacetValue} from './controllers/commerce/core/facets/headless-core-commerce-facet';
export type {
  NumericFacet,
  NumericFacetState,
} from './controllers/commerce/core/facets/numeric/headless-commerce-numeric-facet';
export type {RegularFacet} from './controllers/commerce/core/facets/regular/headless-commerce-regular-facet';

export type {
  ProductList,
  ProductListState,
} from './controllers/commerce/product-listing/headless-product-listing.ssr';
export {defineProductList} from './controllers/commerce/product-listing/headless-product-listing.ssr';

export type {
  ProductListingSummaryState,
  Summary,
} from './controllers/commerce/core/sub-controller/headless-sub-controller.ssr';
export {defineQuerySummary} from './controllers/commerce/core/sub-controller/headless-sub-controller.ssr';

// TODO: KIT-3391 - export other SSR commerce controllers

//#endregion

// Selectors
export {
  baseFacetResponseSelector,
  facetRequestSelector,
  facetResponseSelector,
  facetResponseSelectedValuesSelector,
} from './features/facets/facet-set/facet-set-selectors';

export {
  currentPageSelector,
  maxPageSelector,
  currentPagesSelector,
} from './features/pagination/pagination-selectors';

//#region Grouped actions
export {ResultTemplatesHelpers} from './features/result-templates/result-templates-helpers';
export * from './features/advanced-search-queries/advanced-search-queries-actions-loader';
export * from './features/facets/category-facet-set/category-facet-set-actions-loader';
export * from './features/facets/facet-set/facet-set-actions-loader';
export * from './features/configuration/configuration-actions-loader';
export * from './features/configuration/search-configuration-actions-loader';
export * from './features/context/context-actions-loader';
export * from './features/dictionary-field-context/dictionary-field-context-actions-loader';
export * from './features/debug/debug-actions-loader';
export * from './features/facets/range-facets/date-facet-set/date-facet-actions-loader';
export * from './features/facet-options/facet-options-actions-loader';
export * from './features/did-you-mean/did-you-mean-actions-loader';
export * from './features/fields/fields-actions-loader';
export * from './features/history/history-actions-loader';
export * from './features/facets/range-facets/numeric-facet-set/numeric-facet-actions-loader';
export * from './features/folding/folding-actions-loader';
export * from './features/pagination/pagination-actions-loader';
export * from './features/pipeline/pipeline-actions-loader';
export * from './features/query/query-actions-loader';
export * from './features/query-set/query-set-actions-loader';
export * from './features/instant-results/instant-results-actions-loader';
export * from './features/query-suggest/query-suggest-actions-loader';
export * from './features/search/search-actions-loader';
export * from './features/search-hub/search-hub-actions-loader';
export * from './features/sort-criteria/sort-criteria-actions-loader';
export * from './features/standalone-search-box-set/standalone-search-box-set-actions-loader';
export * from './features/static-filter-set/static-filter-set-actions-loader';
export * from './features/tab-set/tab-set-actions-loader';
export * from './features/question-answering/question-answering-actions-loader';
export * from './features/breadcrumb/breadcrumb-actions-loader';
export * from './features/recent-queries/recent-queries-actions-loader';
export * from './features/recent-results/recent-results-actions-loader';
export * from './features/excerpt-length/excerpt-length-actions-loader';
export * from './features/result-preview/result-preview-actions-loader';
export * from './features/generated-answer/generated-answer-actions-loader';
export {buildResultTemplatesManager} from './features/result-templates/result-templates-manager';
//#endregion
// Analytics Actions
export * from './features/analytics/search-analytics-actions-loader';
export * from './features/analytics/click-analytics-actions-loader';
export * from './features/analytics/generic-analytics-actions-loader';

// Types & Helpers
export {buildSSRSearchParameterSerializer} from './features/search-parameters/search-parameter-serializer.ssr';
export type {
  BaseProduct,
  Product,
  ChildProduct,
} from './api/commerce/common/product';
export type {FieldDescription} from './api/search/fields/fields-response';
export type {Raw} from './api/search/search/raw';
export type {
  TermsToHighlight,
  PhrasesToHighlight,
} from './api/search/search/stemming';
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
export type {
  ResultTemplatesManager,
  ResultTemplate,
  ResultTemplateCondition,
} from './features/result-templates/result-templates-manager';
export {
  platformUrl,
  analyticsUrl,
  getOrganizationEndpoints,
} from './api/platform-client';
export type {PlatformEnvironment} from './utils/url-utils';

export type {
  CategoryFacetValueRequest,
  CategoryFacetSortCriterion,
} from './features/facets/category-facet-set/interfaces/request';
export type {DateRangeRequest} from './features/facets/range-facets/date-facet-set/interfaces/request';
export type {
  CategoryFacetValue,
  CategoryFacetValueCommon,
} from './features/facets/category-facet-set/interfaces/response';
export type {DateFacetValue} from './features/facets/range-facets/date-facet-set/interfaces/response';
export type {
  FacetValueRequest,
  FacetSortCriterion,
} from './features/facets/facet-set/interfaces/request';
export type {FacetResultsMustMatch} from './features/facets/facet-api/request';
export type {NumericRangeRequest} from './features/facets/range-facets/numeric-facet-set/interfaces/request';
export type {NumericFacetValue} from './features/facets/range-facets/numeric-facet-set/interfaces/response';
export type {AnyFacetValueRequest} from './features/facets/generic/interfaces/generic-facet-request';
export type {
  RangeFacetSortCriterion,
  RangeFacetRangeAlgorithm,
} from './features/facets/range-facets/generic/interfaces/request';
export {
  MinimumFieldsToInclude,
  DefaultFieldsToInclude,
  EcommerceDefaultFieldsToInclude,
} from './features/fields/fields-state';
export {buildSearchParameterSerializer} from './features/search-parameters/search-parameter-serializer';
export type {FunctionExecutionTrigger} from './features/triggers/triggers-state';
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
