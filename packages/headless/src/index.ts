import {
  buildMockRaw,
  buildMockSearchAppEngine,
  buildMockResult,
  createMockState,
} from './test/index.js';
import * as HighlightUtils from './utils/highlight.js';

const TestUtils = {
  buildMockRaw,
  buildMockSearchAppEngine,
  buildMockResult,
  createMockState,
};


// 3rd Party Libraries
export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';
export {createAction, createAsyncThunk, createReducer} from '@reduxjs/toolkit';
export type {AnalyticsClientSendEventHook} from 'coveo.analytics';

// Main App
export type {
  SearchEngine,
  SearchEngineOptions,
  SearchEngineConfiguration,
  SearchConfigurationOptions,
} from './app/search-engine/search-engine.js';
export {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from './app/search-engine/search-engine.js';

export type {CoreEngine, ExternalEngineOptions} from './app/engine.js';
export type {
  EngineConfiguration,
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
} from './app/engine-configuration.js';
export type {LoggerOptions} from './app/logger.js';

export type {LogLevel} from './app/logger.js';

// State
export type {
  SearchParametersState,
  SearchAppState,
} from './state/search-app-state.js';

// Controllers
export * from './controllers/index.js';

// Selectors
export {
  baseFacetResponseSelector,
  facetRequestSelector,
  facetResponseSelector,
  facetResponseSelectedValuesSelector,
} from './features/facets/facet-set/facet-set-selectors.js';

export {
  currentPageSelector,
  maxPageSelector,
  currentPagesSelector,
} from './features/pagination/pagination-selectors.js';

// Grouped Actions
export * from './features/index.js';

// Analytics Actions
export * from './features/analytics/index.js';

// Types & Helpers
export {API_DATE_FORMAT} from './api/search/date/date-format.js';
export {TestUtils, HighlightUtils};
export type {Result} from './api/search/search/result.js';
export type {FieldDescription} from './api/search/fields/fields-response.js';
export type {Raw} from './api/search/search/raw.js';
export type {
  TermsToHighlight,
  PhrasesToHighlight,
} from './api/search/search/stemming.js';
export type {
  SortCriterion,
  SortByDate,
  SortByField,
  SortByNoSort,
  SortByQRE,
  SortByRelevancy,
} from './features/sort-criteria/criteria.js';
export {
  SortBy,
  SortOrder,
  buildDateSortCriterion,
  buildCriterionExpression,
  buildFieldSortCriterion,
  buildNoSortCriterion,
  buildQueryRankingExpressionSortCriterion,
  buildRelevanceSortCriterion,
} from './features/sort-criteria/criteria.js';
export {parseCriterionExpression} from './features/sort-criteria/criteria-parser.js';
export type {ResultTemplatesManager} from './features/result-templates/result-templates-manager.js';
export type {
  ResultTemplate,
  ResultTemplateCondition,
} from './features/result-templates/result-templates.js';
export {
  platformUrl,
  analyticsUrl,
  getOrganizationEndpoints,
} from './api/platform-client.js';
export type {PlatformEnvironment} from './utils/url-utils.js';
export type {
  CategoryFacetValueRequest,
  CategoryFacetSortCriterion,
} from './features/facets/category-facet-set/interfaces/request.js';
export type {DateRangeRequest} from './features/facets/range-facets/date-facet-set/interfaces/request.js';
export type {
  CategoryFacetValue,
  CategoryFacetValueCommon,
} from './features/facets/category-facet-set/interfaces/response.js';
export type {DateFacetValue} from './features/facets/range-facets/date-facet-set/interfaces/response.js';
export type {
  FacetValueRequest,
  FacetSortCriterion,
} from './features/facets/facet-set/interfaces/request.js';
export type {FacetResultsMustMatch} from './features/facets/facet-api/request.js';
export type {NumericRangeRequest} from './features/facets/range-facets/numeric-facet-set/interfaces/request.js';
export type {NumericFacetValue} from './features/facets/range-facets/numeric-facet-set/interfaces/response.js';
export type {AnyFacetValueRequest} from './features/facets/generic/interfaces/generic-facet-request.js';
export type {
  RangeFacetSortCriterion,
  RangeFacetRangeAlgorithm,
} from './features/facets/range-facets/generic/interfaces/request.js';
export {
  MinimumFieldsToInclude,
  DefaultFieldsToInclude,
  EcommerceDefaultFieldsToInclude,
} from './features/fields/fields-state.js';
export {buildSearchParameterSerializer} from './features/search-parameters/search-parameter-serializer.js';
export type {FunctionExecutionTrigger} from './features/triggers/triggers-state.js';
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

export * from './utils/query-expression/query-expression.js';
