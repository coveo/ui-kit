import {polyfillCryptoNode} from './api/analytics/analytics-crypto-polyfill';

polyfillCryptoNode();

// 3rd Party Libraries
export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';
export {createAction, createAsyncThunk, createReducer} from '@reduxjs/toolkit';
export type {AnalyticsClientSendEventHook} from 'coveo.analytics';

// Main App
// ⚠️ NOTE: All exported SSR types, APIs should be marked as `@internal` until MVP is complete
export type {
  SearchEngineOptions,
  SearchEngineConfiguration,
  SearchConfigurationOptions,
} from './app/search-engine/search-engine';
export type {
  SSRSearchEngine as SearchEngine,
  SearchEngineDefinition,
  SearchEngineDefinitionOptions,
  SearchCompletedAction,
} from './app/search-engine/search-engine.ssr';
export {defineSearchEngine} from './app/search-engine/search-engine.ssr';
export {getSampleSearchEngineConfiguration} from './app/search-engine/search-engine';

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
export type {
  EngineDefinition,
  InferStaticState,
  InferHydratedState,
  InferBuildResult,
} from './app/ssr-engine/types/core-engine';
export type {LoggerOptions} from './app/logger';

export type {LogLevel} from './app/logger';

// State
export type {
  SearchParametersState,
  SearchAppState,
} from './state/search-app-state';

// Controllers
export * from './controllers/ssr.index';

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

// Grouped Actions
export * from './features/index';

// Analytics Actions
export * from './features/analytics/index';

// Types & Helpers
export {buildSSRSearchParameterSerializer} from './features/search-parameters/search-parameter-serializer.ssr';
export type {Result} from './api/search/search/result';
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
export type {ResultTemplatesManager} from './features/result-templates/result-templates-manager';
export type {
  ResultTemplate,
  ResultTemplateCondition,
} from './features/result-templates/result-templates';
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
