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

// TODO: put in correct order
export type {FacetDefinition} from './controllers/facets/facet/headless-facet.ssr';
export type {ContextDefinition} from './controllers/context/headless-context.ssr';
export type {BreadcrumbManagerDefinition} from './controllers/breadcrumb-manager/headless-breadcrumb-manager.ssr';
export type {DictionaryFieldContextDefinition} from './controllers/dictionary-field-context/headless-dictionary-field-context.ssr';
export type {DidYouMeanDefinition} from './controllers/did-you-mean/headless-did-you-mean.ssr';
export type {FacetManagerDefinition} from './controllers/facet-manager/headless-facet-manager.ssr';
export type {AutomaticFacetGeneratorDefinition} from './controllers/facets/automatic-facet-generator/headless-automatic-facet-generator.ssr';
export type {CategoryFacetDefinition} from './controllers/facets/category-facet/headless-category-facet.ssr';
export type {DateFacetDefinition} from './controllers/facets/range-facet/date-facet/headless-date-facet.ssr';
export type {DateFilterDefinition} from './controllers/facets/range-facet/date-facet/headless-date-filter.ssr';
export type {NumericFacetDefinition} from './controllers/facets/range-facet/numeric-facet/headless-numeric-facet.ssr';
export type {NumericFilterDefinition} from './controllers/facets/range-facet/numeric-facet/headless-numeric-filter.ssr';
export type {CategoryFieldSuggestionsDefinition} from './controllers/field-suggestions/category-facet/headless-category-field-suggestions.ssr';
export type {FieldSuggestionsDefinition} from './controllers/field-suggestions/facet/headless-field-suggestions.ssr';
export type {FoldedResultListDefinition} from './controllers/folded-result-list/headless-folded-result-list.ssr';
export type {HistoryManagerDefinition} from './controllers/history-manager/headless-history-manager.ssr';
export type {PagerDefinition} from './controllers/pager/headless-pager.ssr';
export type {QueryErrorDefinition} from './controllers/query-error/headless-query-error.ssr';
export type {QuerySummaryDefinition} from './controllers/query-summary/headless-query-summary.ssr';
export type {QuickviewDefinition} from './controllers/quickview/headless-quickview.ssr';
export type {RecentQueriesListDefinition} from './controllers/recent-queries-list/headless-recent-queries-list.ssr';
export type {RecentResultsListDefinition} from './controllers/recent-results-list/headless-recent-results-list.ssr';
export type {RelevanceInspectorDefinition} from './controllers/relevance-inspector/headless-relevance-inspector.ssr';
export type {ResultListDefinition} from './controllers/result-list/headless-result-list.ssr';
export type {ResultsPerPageDefinition} from './controllers/results-per-page/headless-results-per-page.ssr';
export type {SearchBoxDefinition} from './controllers/search-box/headless-search-box.ssr';
export type {SearchParameterManagerDefinition} from './controllers/search-parameter-manager/headless-search-parameter-manager.ssr';
export type {SearchStatusDefinition} from './controllers/search-status/headless-search-status.ssr';
export type {SmartSnippetQuestionsListDefinition} from './controllers/smart-snippet-questions-list/headless-smart-snippet-questions-list.ssr';
export type {SmartSnippetDefinition} from './controllers/smart-snippet/headless-smart-snippet.ssr';
export type {SortDefinition} from './controllers/sort/headless-sort.ssr';
export type {StandaloneSearchBoxDefinition} from './controllers/standalone-search-box/headless-standalone-search-box.ssr';
export type {StaticFilterDefinition} from './controllers/static-filter/headless-static-filter.ssr';
export type {TabDefinition} from './controllers/tab/headless-tab.ssr';
export type {ExecuteTriggerDefinition} from './controllers/triggers/headless-execute-trigger.ssr';
export type {NotifyTriggerDefinition} from './controllers/triggers/headless-notify-trigger.ssr';
export type {QueryTriggerDefinition} from './controllers/triggers/headless-query-trigger.ssr';
export type {RedirectionTriggerDefinition} from './controllers/triggers/headless-redirection-trigger.ssr';

// export type
export type {CoreEngine, ExternalEngineOptions} from './app/engine';
export type {
  EngineConfiguration,
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
} from './app/engine-configuration';
export type {
  ControllerDefinitionWithoutProps, // TODO: remove if each controller has its own definition type
  ControllerDefinitionWithProps, // TODO: remove if each controller has
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
