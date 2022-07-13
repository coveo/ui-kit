// 3rd Party Libraries
export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';

// Main App
export type {
  InsightEngine,
  InsightEngineOptions,
  InsightEngineConfiguration,
} from './app/insight-engine/insight-engine';
export {buildInsightEngine} from './app/insight-engine/insight-engine';

export type {CoreEngine, ExternalEngineOptions} from './app/engine';
export type {
  EngineConfiguration,
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
} from './app/engine-configuration';
export type {LoggerOptions} from './app/logger';

export type {LogLevel} from './app/logger';

// Action loaders
export * from './features/insight-interface/insight-interface-actions-loader';
export * from './features/insight-search/insight-search-actions-loader';

// Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller';
export {buildController} from './controllers/controller/headless-controller';

export type {
  CategoryFacetOptions,
  CategoryFacetSearchOptions,
  CategoryFacetProps,
  CategoryFacetState,
  CategoryFacet,
  CategoryFacetValue,
  CategoryFacetSearch,
  CategoryFacetSearchState,
  CategoryFacetSearchResult,
  CoreCategoryFacet,
  CoreCategoryFacetState,
} from './controllers/insight/facets/category-facet/headless-insight-category-facet';
export {buildCategoryFacet} from './controllers/insight/facets/category-facet/headless-insight-category-facet';

export type {
  QuerySummaryState,
  QuerySummary,
} from './controllers/insight/query-summary/headless-insight-query-summary';
export {buildQuerySummary} from './controllers/insight/query-summary/headless-insight-query-summary';
export {buildCoreQuerySummary} from './controllers/core/query-summary/headless-core-query-summary';

export type {
  Quickview,
  QuickviewOptions,
  QuickviewProps,
  QuickviewState,
} from './controllers/insight/quickview/headless-insight-quickview';
export {buildQuickview} from './controllers/insight/quickview/headless-insight-quickview';
export {buildCoreQuickview} from './controllers/core/quickview/headless-core-quickview';

export type {
  ResultListProps,
  ResultListOptions,
  ResultListState,
  ResultList,
} from './controllers/insight/result-list/headless-insight-result-list';
export {buildResultList} from './controllers/insight/result-list/headless-insight-result-list';
export {buildCoreResultList} from './controllers/core/result-list/headless-core-result-list';

export type {
  InsightInteractiveResultOptions,
  InsightInteractiveResultProps,
  InsightInteractiveResult,
} from './controllers/insight/result-list/headless-insight-interactive-result';
export {buildInsightInteractiveResult} from './controllers/insight/result-list/headless-insight-interactive-result';

export type {
  ResultsPerPageInitialState,
  ResultsPerPageProps,
  ResultsPerPageState,
  ResultsPerPage,
} from './controllers/insight/results-per-page/headless-insight-results-per-page';
export {buildResultsPerPage} from './controllers/insight/results-per-page/headless-insight-results-per-page';
export {buildCoreResultsPerPage} from './controllers/core/results-per-page/headless-core-results-per-page';

export type {
  SearchBoxOptions,
  SearchBoxProps,
  SearchBoxState,
  SearchBox,
  Suggestion,
  SuggestionHighlightingOptions,
  Delimiters,
} from './controllers/insight/search-box/headless-insight-search-box';
export {buildSearchBox} from './controllers/insight/search-box/headless-insight-search-box';
export {buildCoreSearchBox} from './controllers/core/search-box/headless-core-search-box';

export type {
  SearchStatus,
  SearchStatusState,
} from './controllers/insight/status/headless-insight-status';
export {buildSearchStatus} from './controllers/insight/status/headless-insight-status';
export {buildCoreSearchStatus} from './controllers/core/status/headless-core-status';

export type {
  TabProps,
  TabState,
  Tab,
} from './controllers/insight/tab/headless-insight-tab';
export {buildTab} from './controllers/insight/tab/headless-insight-tab';
export {buildCoreTab} from './controllers/core/tab/headless-core-tab';

export type {InsightInterfaceState} from './features/insight-interface/insight-interface-state';
export type {InsightInterface} from './controllers/insight-interface/insight-interface';
export {buildInsightInterface} from './controllers/insight-interface/insight-interface';
