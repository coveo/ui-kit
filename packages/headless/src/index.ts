import * as TestUtils from './test';
import * as HighlightUtils from './utils/highlight';

// 3rd Party Libraries
export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';
export {createAction, createAsyncThunk, createReducer} from '@reduxjs/toolkit';

// Main App
export type {
  SearchEngine,
  SearchEngineOptions,
  SearchEngineConfiguration,
  SearchConfigurationOptions,
} from './app/search-engine/search-engine';
export {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from './app/search-engine/search-engine';

export type {CoreEngine, ExternalEngineOptions} from './app/engine';
export type {
  EngineConfiguration,
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
} from './app/engine-configuration';
export type {LoggerOptions} from './app/logger';

export type {LogLevel} from './app/logger';

// State
export type {
  SearchParametersState,
  SearchAppState,
} from './state/search-app-state';

// Controllers
export * from './controllers/index';

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
export {TestUtils, HighlightUtils};
export type {Result} from './api/search/search/result';
export type {FieldDescription} from './api/search/fields/fields-response';
export type {Raw} from './api/search/search/raw';
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
export {platformUrl, analyticsUrl} from './api/platform-client';
export type {CategoryFacetSortCriterion} from './features/facets/category-facet-set/interfaces/request';
export type {CategoryFacetValue} from './features/facets/category-facet-set/interfaces/response';
export type {DateFacetValue} from './features/facets/range-facets/date-facet-set/interfaces/response';
export type {FacetSortCriterion} from './features/facets/facet-set/interfaces/request';
export type {NumericFacetValue} from './features/facets/range-facets/numeric-facet-set/interfaces/response';
export type {
  RangeFacetSortCriterion,
  RangeFacetRangeAlgorithm,
} from './features/facets/range-facets/generic/interfaces/request';
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
