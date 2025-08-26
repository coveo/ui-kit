/**
 * The Coveo Headless Search sub-package exposes exposes the engine, controllers, actions, and utility functions to build a search experience.
 *
 * @example
 * ```typescript
 * import { buildSearchBox, buildSearchEngine, getSampleSearchEngineConfiguration } from '@coveo/headless';
 *
 * const engine = buildSearchEngine({
 *    configuration: getSampleSearchEngineConfiguration()
 * });
 *
 * const searchBox = buildSearchBox(engine);
 * ```
 * @module Search
 */
import * as HighlightUtils from './utils/highlight.js';

export type {Relay} from '@coveo/relay';
// 3rd Party Libraries
export type {Middleware, Unsubscribe} from '@reduxjs/toolkit';
export type {AnalyticsClientSendEventHook} from 'coveo.analytics';
export type {ExecuteTriggerParams} from './api/common/trigger.js';
export type {CoreEngine, ExternalEngineOptions} from './app/engine.js';
export type {
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
  EngineConfiguration,
} from './app/engine-configuration.js';
export type {LoggerOptions, LogLevel} from './app/logger.js';
export type {NavigatorContext} from './app/navigator-context-provider.js';
// Main App
export type {
  SearchConfigurationOptions,
  SearchEngine,
  SearchEngineConfiguration,
  SearchEngineOptions,
} from './app/search-engine/search-engine.js';
export {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from './app/search-engine/search-engine.js';
export type {
  AutomaticFacetBreadcrumb,
  Breadcrumb,
  BreadcrumbManager,
  BreadcrumbManagerState,
  BreadcrumbValue,
  CategoryFacetBreadcrumb,
  CoreBreadcrumbManager,
  CoreBreadcrumbManagerState,
  DateFacetBreadcrumb,
  DeselectableValue,
  FacetBreadcrumb,
  NumericFacetBreadcrumb,
  StaticFilterBreadcrumb,
} from './controllers/breadcrumb-manager/headless-breadcrumb-manager.js';
export {buildBreadcrumbManager} from './controllers/breadcrumb-manager/headless-breadcrumb-manager.js';
export type {
  Context,
  ContextInitialState,
  ContextPayload,
  ContextProps,
  ContextState,
  ContextValue,
} from './controllers/context/headless-context.js';
export {buildContext} from './controllers/context/headless-context.js';
export type {ErrorPayload} from './controllers/controller/error-payload.js';
//#region Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller.js';
export {buildController} from './controllers/controller/headless-controller.js';
export type {
  AnyFacetValuesCondition,
  FacetConditionsManager,
} from './controllers/core/facets/facet-conditions-manager/headless-facet-conditions-manager.js';
export {buildCoreFacetConditionsManager as buildFacetConditionsManager} from './controllers/core/facets/facet-conditions-manager/headless-facet-conditions-manager.js';
export type {
  InteractiveResultCore,
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
} from './controllers/core/interactive-result/headless-core-interactive-result.js';
export type {
  NotifyTrigger,
  NotifyTriggerState,
} from './controllers/core/triggers/headless-core-notify-trigger.js';
export type {
  QueryTrigger,
  QueryTriggerState,
} from './controllers/core/triggers/headless-core-query-trigger.js';
export type {
  RedirectionTrigger,
  RedirectionTriggerState,
} from './controllers/core/triggers/headless-core-redirection-trigger.js';
export type {
  DictionaryFieldContext,
  DictionaryFieldContextPayload,
  DictionaryFieldContextState,
} from './controllers/dictionary-field-context/headless-dictionary-field-context.js';
export {buildDictionaryFieldContext} from './controllers/dictionary-field-context/headless-dictionary-field-context.js';
export type {
  DidYouMean,
  DidYouMeanOptions,
  DidYouMeanProps,
  DidYouMeanState,
  QueryCorrection,
  WordCorrection,
} from './controllers/did-you-mean/headless-did-you-mean.js';
export {buildDidYouMean} from './controllers/did-you-mean/headless-did-you-mean.js';
export type {
  FacetManager,
  FacetManagerPayload,
  FacetManagerState,
} from './controllers/facet-manager/headless-facet-manager.js';
export {buildFacetManager} from './controllers/facet-manager/headless-facet-manager.js';
export type {
  AutomaticFacet,
  AutomaticFacetGenerator,
  AutomaticFacetGeneratorOptions,
  AutomaticFacetGeneratorProps,
  AutomaticFacetGeneratorState,
  AutomaticFacetState,
} from './controllers/facets/automatic-facet-generator/headless-automatic-facet-generator.js';
export {buildAutomaticFacetGenerator} from './controllers/facets/automatic-facet-generator/headless-automatic-facet-generator.js';
export type {
  CategoryFacet,
  CategoryFacetOptions,
  CategoryFacetProps,
  CategoryFacetSearch,
  CategoryFacetSearchOptions,
  CategoryFacetSearchResult,
  CategoryFacetSearchState,
  CategoryFacetState,
  CoreCategoryFacet,
  CoreCategoryFacetState,
} from './controllers/facets/category-facet/headless-category-facet.js';
export {buildCategoryFacet} from './controllers/facets/category-facet/headless-category-facet.js';
export type {
  CoreFacet,
  CoreFacetState,
  Facet,
  FacetOptions,
  FacetProps,
  FacetSearch,
  FacetSearchOptions,
  FacetSearchState,
  FacetState,
  FacetValue,
  FacetValueState,
  SpecificFacetSearchResult,
} from './controllers/facets/facet/headless-facet.js';
export {buildFacet} from './controllers/facets/facet/headless-facet.js';
export type {
  DateFacet,
  DateFacetOptions,
  DateFacetProps,
  DateFacetState,
  DateRangeInput,
  DateRangeOptions,
} from './controllers/facets/range-facet/date-facet/headless-date-facet.js';
export {
  buildDateFacet,
  buildDateRange,
} from './controllers/facets/range-facet/date-facet/headless-date-facet.js';
export type {
  DateFilter,
  DateFilterInitialState,
  DateFilterOptions,
  DateFilterProps,
  DateFilterRange,
  DateFilterState,
} from './controllers/facets/range-facet/date-facet/headless-date-filter.js';
export {buildDateFilter} from './controllers/facets/range-facet/date-facet/headless-date-filter.js';
export type {
  NumericFacet,
  NumericFacetOptions,
  NumericFacetProps,
  NumericFacetState,
  NumericRangeOptions,
} from './controllers/facets/range-facet/numeric-facet/headless-numeric-facet.js';
export {
  buildNumericFacet,
  buildNumericRange,
} from './controllers/facets/range-facet/numeric-facet/headless-numeric-facet.js';
export type {
  NumericFilter,
  NumericFilterInitialState,
  NumericFilterOptions,
  NumericFilterProps,
  NumericFilterRange,
  NumericFilterState,
} from './controllers/facets/range-facet/numeric-facet/headless-numeric-filter.js';
export {buildNumericFilter} from './controllers/facets/range-facet/numeric-facet/headless-numeric-filter.js';
export type {
  CategoryFieldSuggestions,
  CategoryFieldSuggestionsOptions,
  CategoryFieldSuggestionsProps,
  CategoryFieldSuggestionsState,
  CategoryFieldSuggestionsValue,
} from './controllers/field-suggestions/category-facet/headless-category-field-suggestions.js';
export {buildCategoryFieldSuggestions} from './controllers/field-suggestions/category-facet/headless-category-field-suggestions.js';
export type {
  FieldSuggestions,
  FieldSuggestionsOptions,
  FieldSuggestionsProps,
  FieldSuggestionsState,
  FieldSuggestionsValue,
} from './controllers/field-suggestions/facet/headless-field-suggestions.js';
export {buildFieldSuggestions} from './controllers/field-suggestions/facet/headless-field-suggestions.js';
export type {
  FoldedCollection,
  FoldedResult,
  FoldedResultList,
  FoldedResultListOptions,
  FoldedResultListProps,
  FoldedResultListState,
  FoldingOptions,
} from './controllers/folded-result-list/headless-folded-result-list.js';
export {buildFoldedResultList} from './controllers/folded-result-list/headless-folded-result-list.js';
export type {
  GeneratedAnswer,
  GeneratedAnswerCitation,
  GeneratedAnswerProps,
  GeneratedAnswerPropsInitialState,
  GeneratedAnswerState,
  GeneratedResponseFormat,
} from './controllers/generated-answer/headless-generated-answer.js';
export {buildGeneratedAnswer} from './controllers/generated-answer/headless-generated-answer.js';
export type {
  InteractiveCitation,
  InteractiveCitationOptions,
  InteractiveCitationProps,
} from './controllers/generated-answer/headless-interactive-citation.js';
export {buildInteractiveCitation} from './controllers/generated-answer/headless-interactive-citation.js';
export type {
  HistoryManager,
  HistoryManagerState,
} from './controllers/history-manager/headless-history-manager.js';
export {buildHistoryManager} from './controllers/history-manager/headless-history-manager.js';
export type {
  InteractiveInstantResult,
  InteractiveInstantResultOptions,
  InteractiveInstantResultProps,
} from './controllers/instant-results/headless-interactive-instant-result.js';
export {buildInteractiveInstantResult} from './controllers/instant-results/headless-interactive-instant-result.js';
export type {
  InstantResultOptions,
  InstantResultProps,
  InstantResults,
  InstantResultsState,
} from './controllers/instant-results/instant-results.js';
export {buildInstantResults} from './controllers/instant-results/instant-results.js';
export type {
  Pager,
  PagerInitialState,
  PagerOptions,
  PagerProps,
  PagerState,
} from './controllers/pager/headless-pager.js';
export {buildPager} from './controllers/pager/headless-pager.js';
export type {
  QueryError,
  QueryErrorState,
} from './controllers/query-error/headless-query-error.js';
export {buildQueryError} from './controllers/query-error/headless-query-error.js';
export type {
  QuerySummary,
  QuerySummaryState,
} from './controllers/query-summary/headless-query-summary.js';
export {buildQuerySummary} from './controllers/query-summary/headless-query-summary.js';
export type {
  CoreQuickview,
  CoreQuickviewState,
  Quickview,
  QuickviewOptions,
  QuickviewProps,
  QuickviewState,
} from './controllers/quickview/headless-quickview.js';
export {buildQuickview} from './controllers/quickview/headless-quickview.js';
export type {
  RecentQueriesList,
  RecentQueriesListInitialState,
  RecentQueriesListOptions,
  RecentQueriesListProps,
  RecentQueriesState,
} from './controllers/recent-queries-list/headless-recent-queries-list.js';
export {buildRecentQueriesList} from './controllers/recent-queries-list/headless-recent-queries-list.js';
export type {
  InteractiveRecentResult,
  InteractiveRecentResultOptions,
  InteractiveRecentResultProps,
} from './controllers/recent-results-list/headless-interactive-recent-result.js';
export {buildInteractiveRecentResult} from './controllers/recent-results-list/headless-interactive-recent-result.js';
export type {
  RecentResultsList,
  RecentResultsListInitialState,
  RecentResultsListOptions,
  RecentResultsListProps,
  RecentResultsState,
} from './controllers/recent-results-list/headless-recent-results-list.js';
export {buildRecentResultsList} from './controllers/recent-results-list/headless-recent-results-list.js';
export type {
  DocumentWeights,
  ExecutionReport,
  ExecutionStep,
  QueryExpressions,
  QueryRankingExpression,
  QueryRankingExpressionWeights,
  RankingInformation,
  RelevanceInspector,
  RelevanceInspectorInitialState,
  RelevanceInspectorProps,
  RelevanceInspectorState,
  ResultRankingInformation,
  SecurityIdentity,
  TermWeightReport,
} from './controllers/relevance-inspector/headless-relevance-inspector.js';
export {buildRelevanceInspector} from './controllers/relevance-inspector/headless-relevance-inspector.js';
export type {
  InteractiveResult,
  InteractiveResultOptions,
  InteractiveResultProps,
} from './controllers/result-list/headless-interactive-result.js';
export {buildInteractiveResult} from './controllers/result-list/headless-interactive-result.js';
export type {
  ResultList,
  ResultListOptions,
  ResultListProps,
  ResultListState,
} from './controllers/result-list/headless-result-list.js';
export {buildResultList} from './controllers/result-list/headless-result-list.js';
export type {
  ResultsPerPage,
  ResultsPerPageInitialState,
  ResultsPerPageProps,
  ResultsPerPageState,
} from './controllers/results-per-page/headless-results-per-page.js';
export {buildResultsPerPage} from './controllers/results-per-page/headless-results-per-page.js';
export type {
  Delimiters,
  SearchBox,
  SearchBoxOptions,
  SearchBoxProps,
  SearchBoxState,
  Suggestion,
  SuggestionHighlightingOptions,
} from './controllers/search-box/headless-search-box.js';
export {buildSearchBox} from './controllers/search-box/headless-search-box.js';
export type {
  SearchParameterManager,
  SearchParameterManagerInitialState,
  SearchParameterManagerProps,
  SearchParameterManagerState,
  SearchParameters,
} from './controllers/search-parameter-manager/headless-search-parameter-manager.js';
export {buildSearchParameterManager} from './controllers/search-parameter-manager/headless-search-parameter-manager.js';
export type {
  SearchStatus,
  SearchStatusState,
} from './controllers/search-status/headless-search-status.js';
export {buildSearchStatus} from './controllers/search-status/headless-search-status.js';
export type {
  QuestionAnswerDocumentIdentifier,
  SmartSnippet,
  SmartSnippetCore,
  SmartSnippetOptions,
  SmartSnippetProps,
  SmartSnippetState,
} from './controllers/smart-snippet/headless-smart-snippet.js';
export {buildSmartSnippet} from './controllers/smart-snippet/headless-smart-snippet.js';
export type {InlineLink} from './controllers/smart-snippet/headless-smart-snippet-interactive-inline-links.js';
export type {
  CoreSmartSnippetQuestionsList,
  CoreSmartSnippetQuestionsListState,
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListOptions,
  SmartSnippetQuestionsListProps,
  SmartSnippetQuestionsListState,
  SmartSnippetRelatedQuestion,
} from './controllers/smart-snippet-questions-list/headless-smart-snippet-questions-list.js';
export {buildSmartSnippetQuestionsList} from './controllers/smart-snippet-questions-list/headless-smart-snippet-questions-list.js';
export type {
  Sort,
  SortInitialState,
  SortProps,
  SortState,
} from './controllers/sort/headless-sort.js';
export {buildSort} from './controllers/sort/headless-sort.js';
export type {
  StandaloneSearchBox,
  StandaloneSearchBoxAnalytics,
  StandaloneSearchBoxOptions,
  StandaloneSearchBoxProps,
  StandaloneSearchBoxState,
} from './controllers/standalone-search-box/headless-standalone-search-box.js';
export {buildStandaloneSearchBox} from './controllers/standalone-search-box/headless-standalone-search-box.js';
export type {
  StaticFilter,
  StaticFilterOptions,
  StaticFilterProps,
  StaticFilterState,
  StaticFilterValue,
  StaticFilterValueOptions,
  StaticFilterValueState,
} from './controllers/static-filter/headless-static-filter.js';
export {
  buildStaticFilter,
  buildStaticFilterValue,
} from './controllers/static-filter/headless-static-filter.js';
export type {
  Tab,
  TabInitialState,
  TabOptions,
  TabProps,
  TabState,
} from './controllers/tab/headless-tab.js';
export {buildTab} from './controllers/tab/headless-tab.js';
export type {
  TabManager,
  TabManagerState,
} from './controllers/tab-manager/headless-tab-manager.js';
export {buildTabManager} from './controllers/tab-manager/headless-tab-manager.js';
export type {
  ExecuteTrigger,
  ExecuteTriggerState,
} from './controllers/triggers/headless-execute-trigger.js';
export {buildExecuteTrigger} from './controllers/triggers/headless-execute-trigger.js';
export {buildNotifyTrigger} from './controllers/triggers/headless-notify-trigger.js';
export {buildQueryTrigger} from './controllers/triggers/headless-query-trigger.js';
export {buildRedirectionTrigger} from './controllers/triggers/headless-redirection-trigger.js';
export type {
  UrlManager,
  UrlManagerInitialState,
  UrlManagerProps,
  UrlManagerState,
} from './controllers/url-manager/headless-url-manager.js';
export {buildUrlManager} from './controllers/url-manager/headless-url-manager.js';
// State
export type {
  SearchAppState,
  SearchParametersState,
} from './state/search-app-state.js';

//#endregion

//#endregion

// Types & Helpers
export {
  getAnalyticsNextApiBaseUrl,
  getOrganizationEndpoint,
  getSearchApiBaseUrl,
} from './api/platform-client.js';
export {API_DATE_FORMAT} from './api/search/date/date-format.js';
export * from './features/actions-history/ipx-actions-history-actions-loader.js';
export * from './features/advanced-search-queries/advanced-search-queries-actions-loader.js';
export * from './features/analytics/click-analytics-actions-loader.js';
export * from './features/analytics/generic-analytics-actions-loader.js';
//#endregion
// Analytics Actions
export * from './features/analytics/search-analytics-actions-loader.js';
export * from './features/breadcrumb/breadcrumb-actions-loader.js';
export * from './features/configuration/configuration-actions-loader.js';
export * from './features/configuration/search-configuration-actions-loader.js';
export * from './features/context/context-actions-loader.js';
export * from './features/debug/debug-actions-loader.js';
export * from './features/dictionary-field-context/dictionary-field-context-actions-loader.js';
export * from './features/did-you-mean/did-you-mean-actions-loader.js';
export * from './features/excerpt-length/excerpt-length-actions-loader.js';
export * from './features/facet-options/facet-options-actions-loader.js';
export * from './features/facets/automatic-facet-set/automatic-facet-set-actions-loader.js';
export * from './features/facets/category-facet-set/category-facet-set-actions-loader.js';
export * from './features/facets/facet-set/facet-set-actions-loader.js';
// Selectors
export {
  baseFacetResponseSelector,
  facetRequestSelector,
  facetResponseSelectedValuesSelector,
  facetResponseSelector,
} from './features/facets/facet-set/facet-set-selectors.js';
export * from './features/facets/range-facets/date-facet-set/date-facet-actions-loader.js';
export * from './features/facets/range-facets/numeric-facet-set/numeric-facet-actions-loader.js';
export * from './features/fields/fields-actions-loader.js';
export * from './features/folding/folding-actions-loader.js';
export * from './features/generated-answer/generated-answer-actions-loader.js';
export * from './features/history/history-actions-loader.js';
export * from './features/instant-results/instant-results-actions-loader.js';
export * from './features/pagination/pagination-actions-loader.js';
export {
  currentPageSelector,
  currentPagesSelector,
  maxPageSelector,
} from './features/pagination/pagination-selectors.js';
export * from './features/pipeline/pipeline-actions-loader.js';
export * from './features/query/query-actions-loader.js';
export * from './features/query-set/query-set-actions-loader.js';
export * from './features/query-suggest/query-suggest-actions-loader.js';
export * from './features/question-answering/question-answering-actions-loader.js';
export * from './features/recent-queries/recent-queries-actions-loader.js';
export * from './features/recent-results/recent-results-actions-loader.js';
export * from './features/result-preview/result-preview-actions-loader.js';
//#region Grouped actions
export {ResultTemplatesHelpers} from './features/result-templates/result-templates-helpers.js';
export {buildResultTemplatesManager} from './features/result-templates/result-templates-manager.js';
export * from './features/search/search-actions-loader.js';
export * from './features/search-hub/search-hub-actions-loader.js';
export * from './features/search-parameters/search-parameter-actions-loader.js';
export * from './features/sort-criteria/sort-criteria-actions-loader.js';
export * from './features/standalone-search-box-set/standalone-search-box-set-actions-loader.js';
export * from './features/static-filter-set/static-filter-set-actions-loader.js';
export * from './features/tab-set/tab-set-actions-loader.js';
export {HighlightUtils};
export type {
  RelativeDate,
  RelativeDatePeriod,
  RelativeDateUnit,
} from './api/search/date/relative-date.js';
export {
  deserializeRelativeDate,
  validateRelativeDate,
} from './api/search/date/relative-date.js';
export type {FieldDescription} from './api/search/fields/fields-response.js';
export type {Raw} from './api/search/search/raw.js';
export type {Result} from './api/search/search/result.js';
export type {
  PhrasesToHighlight,
  TermsToHighlight,
} from './api/search/search/stemming.js';
export type {
  CategoryFacetSortCriterion,
  CategoryFacetValueRequest,
} from './features/facets/category-facet-set/interfaces/request.js';
export type {
  CategoryFacetValue,
  CategoryFacetValueCommon,
} from './features/facets/category-facet-set/interfaces/response.js';
export type {FacetResultsMustMatch} from './features/facets/facet-api/request.js';
export type {
  FacetSortCriterion,
  FacetValueRequest,
} from './features/facets/facet-set/interfaces/request.js';
export type {AnyFacetValueRequest} from './features/facets/generic/interfaces/generic-facet-request.js';
export type {DateRangeRequest} from './features/facets/range-facets/date-facet-set/interfaces/request.js';
export type {DateFacetValue} from './features/facets/range-facets/date-facet-set/interfaces/response.js';
export type {
  RangeFacetRangeAlgorithm,
  RangeFacetSortCriterion,
} from './features/facets/range-facets/generic/interfaces/request.js';
export type {NumericRangeRequest} from './features/facets/range-facets/numeric-facet-set/interfaces/request.js';
export type {NumericFacetValue} from './features/facets/range-facets/numeric-facet-set/interfaces/response.js';
export {
  DefaultFieldsToInclude,
  EcommerceDefaultFieldsToInclude,
  MinimumFieldsToInclude,
} from './features/fields/fields-state.js';
export type {
  GeneratedAnswerFeedback,
  GeneratedAnswerFeedbackOption,
} from './features/generated-answer/generated-answer-analytics-actions.js';
export type {GeneratedContentFormat} from './features/generated-answer/generated-response-format.js';
export type {
  ResultTemplate,
  ResultTemplateCondition,
  ResultTemplatesManager,
} from './features/result-templates/result-templates-manager.js';
export {buildSearchParameterSerializer} from './features/search-parameters/search-parameter-serializer.js';
export type {
  SortByDate,
  SortByField,
  SortByNoSort,
  SortByQRE,
  SortByRelevancy,
  SortCriterion,
} from './features/sort-criteria/criteria.js';
export {
  buildCriterionExpression,
  buildDateSortCriterion,
  buildFieldSortCriterion,
  buildNoSortCriterion,
  buildQueryRankingExpressionSortCriterion,
  buildRelevanceSortCriterion,
  SortBy,
  SortOrder,
} from './features/sort-criteria/criteria.js';
export {parseCriterionExpression} from './features/sort-criteria/criteria-parser.js';
export type {
  Template,
  TemplatesManager,
} from './features/templates/templates-manager.js';
export type {FunctionExecutionTrigger} from './features/triggers/triggers-state.js';
export type {HighlightKeyword} from './utils/highlight.js';
export * from './utils/query-expression/query-expression.js';
export type {PlatformEnvironment} from './utils/url-utils.js';
export {VERSION} from './utils/version.js';
