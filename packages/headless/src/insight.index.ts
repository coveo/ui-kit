/**
 * The Coveo Headless Insight sub-package exposes exposes the engine, controllers, actions, and utility functions to build an insight experience.
 *
 * @example
 * ```typescript
 * import { buildSearchBox, buildInsightEngine, getSampleInsightEngineConfiguration } from '@coveo/headless/insight';
 *
 * const engine = buildInsightEngine({
 *    configuration: getSampleInsightEngineConfiguration()
 * });
 *
 * const searchBox = buildSearchBox(engine);
 * ```
 * @module Insight
 */
import * as HighlightUtils from './utils/highlight.js';

export type {Relay} from '@coveo/relay';
// 3rd Party Libraries
export type {Middleware, Unsubscribe} from '@reduxjs/toolkit';
// Types & Helpers
export type {Raw} from './api/search/search/raw.js';
export type {Result} from './api/search/search/result.js';
export type {InsightAPIErrorStatusResponse} from './api/service/insight/insight-api-client.js';
export type {CoreEngine, ExternalEngineOptions} from './app/engine.js';
export type {
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
  EngineConfiguration,
} from './app/engine-configuration.js';
// Main App
export type {
  InsightEngine,
  InsightEngineConfiguration,
  InsightEngineOptions,
  InsightEngineSearchConfigurationOptions,
} from './app/insight-engine/insight-engine.js';
export {
  buildInsightEngine,
  getSampleInsightEngineConfiguration,
} from './app/insight-engine/insight-engine.js';
export type {LoggerOptions, LogLevel} from './app/logger.js';
export type {NavigatorContext} from './app/navigator-context-provider.js';
// Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller.js';
export {buildController} from './controllers/controller/headless-controller.js';
export type {
  AttachToCase,
  AttachToCaseOptions,
  AttachToCaseProps,
} from './controllers/insight/attach-to-case/headless-attach-to-case.js';
export {buildAttachToCase} from './controllers/insight/attach-to-case/headless-attach-to-case.js';
export type {
  AttachedResults,
  AttachedResultsOptions,
  AttachedResultsProps,
  AttachedResultsState,
} from './controllers/insight/attached-results/headless-attached-results.js';
export {buildAttachedResults} from './controllers/insight/attached-results/headless-attached-results.js';
export type {
  Breadcrumb,
  BreadcrumbManager,
  BreadcrumbManagerState,
  BreadcrumbValue,
  CategoryFacetBreadcrumb,
  DateFacetBreadcrumb,
  DeselectableValue,
  FacetBreadcrumb,
  NumericFacetBreadcrumb,
  StaticFilterBreadcrumb,
} from './controllers/insight/breadcrumb-manager/headless-insight-breadcrumb-manager.js';
export {buildBreadcrumbManager} from './controllers/insight/breadcrumb-manager/headless-insight-breadcrumb-manager.js';
export type {
  DidYouMean,
  DidYouMeanOptions,
  DidYouMeanProps,
  DidYouMeanState,
  QueryCorrection,
  WordCorrection,
} from './controllers/insight/did-you-mean/headless-insight-did-you-mean.js';
export {buildDidYouMean} from './controllers/insight/did-you-mean/headless-insight-did-you-mean.js';
export type {
  AnyFacetValuesCondition,
  FacetConditionsManager,
  FacetConditionsManagerProps,
} from './controllers/insight/facet-conditions-manager/headless-facet-conditions-manager.js';
export {buildFacetConditionsManager} from './controllers/insight/facet-conditions-manager/headless-facet-conditions-manager.js';
export type {
  FacetManager,
  FacetManagerPayload,
  FacetManagerState,
} from './controllers/insight/facet-manager/headless-insight-facet-manager.js';
export {buildFacetManager} from './controllers/insight/facet-manager/headless-insight-facet-manager.js';
export type {
  CategoryFacet,
  CategoryFacetOptions,
  CategoryFacetProps,
  CategoryFacetSearch,
  CategoryFacetSearchOptions,
  CategoryFacetSearchResult,
  CategoryFacetSearchState,
  CategoryFacetState,
  CategoryFacetValue,
  CategoryFacetValueCommon,
  CoreCategoryFacet,
  CoreCategoryFacetState,
} from './controllers/insight/facets/category-facet/headless-insight-category-facet.js';
export {buildCategoryFacet} from './controllers/insight/facets/category-facet/headless-insight-category-facet.js';
export type {
  CoreFacet,
  CoreFacetOptions,
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
} from './controllers/insight/facets/facet/headless-insight-facet.js';
export {buildFacet} from './controllers/insight/facets/facet/headless-insight-facet.js';
export type {
  DateFacet,
  DateFacetOptions,
  DateFacetProps,
  DateFacetState,
  DateRangeInput,
  DateRangeOptions,
  DateRangeRequest,
} from './controllers/insight/facets/range-facet/date-facet/headless-insight-date-facet.js';
export {
  buildDateFacet,
  buildDateRange,
} from './controllers/insight/facets/range-facet/date-facet/headless-insight-date-facet.js';
export type {
  DateFilter,
  DateFilterInitialState,
  DateFilterOptions,
  DateFilterProps,
  DateFilterRange,
  DateFilterState,
} from './controllers/insight/facets/range-facet/date-facet/headless-insight-date-filter.js';
export {buildDateFilter} from './controllers/insight/facets/range-facet/date-facet/headless-insight-date-filter.js';
export type {
  NumericFacet,
  NumericFacetOptions,
  NumericFacetProps,
  NumericFacetState,
  NumericRangeOptions,
  NumericRangeRequest,
} from './controllers/insight/facets/range-facet/numeric-facet/headless-insight-numeric-facet.js';
export {
  buildNumericFacet,
  buildNumericRange,
} from './controllers/insight/facets/range-facet/numeric-facet/headless-insight-numeric-facet.js';
export type {
  NumericFilter,
  NumericFilterInitialState,
  NumericFilterOptions,
  NumericFilterProps,
  NumericFilterRange,
  NumericFilterState,
} from './controllers/insight/facets/range-facet/numeric-facet/headless-insight-numeric-filter.js';
export {buildNumericFilter} from './controllers/insight/facets/range-facet/numeric-facet/headless-insight-numeric-filter.js';
export type {
  FoldedCollection,
  FoldedResult,
  FoldedResultList,
  FoldedResultListOptions,
  FoldedResultListState,
  FoldingOptions,
  InsightFoldedResultListProps,
} from './controllers/insight/folded-result-list/headless-insight-folded-result-list.js';
export {buildFoldedResultList} from './controllers/insight/folded-result-list/headless-insight-folded-result-list.js';
export type {
  GeneratedAnswer,
  GeneratedAnswerProps,
  GeneratedAnswerState,
} from './controllers/insight/generated-answer/headless-insight-generated-answer.js';
export {buildGeneratedAnswer} from './controllers/insight/generated-answer/headless-insight-generated-answer.js';
export type {
  InteractiveCitation,
  InteractiveCitationOptions,
  InteractiveCitationProps,
} from './controllers/insight/generated-answer/headless-insight-interactive-citation.js';
export {buildInteractiveCitation} from './controllers/insight/generated-answer/headless-insight-interactive-citation.js';
export type {
  Pager,
  PagerInitialState,
  PagerOptions,
  PagerProps,
  PagerState,
} from './controllers/insight/pager/headless-insight-pager.js';
export {buildPager} from './controllers/insight/pager/headless-insight-pager.js';
export type {
  QueryError,
  QueryErrorState,
} from './controllers/insight/query-error/headless-insight-query-error.js';
export {buildQueryError} from './controllers/insight/query-error/headless-insight-query-error.js';
export type {
  QuerySummary,
  QuerySummaryState,
} from './controllers/insight/query-summary/headless-insight-query-summary.js';
export {buildQuerySummary} from './controllers/insight/query-summary/headless-insight-query-summary.js';
export type {
  Quickview,
  QuickviewOptions,
  QuickviewProps,
  QuickviewState,
} from './controllers/insight/quickview/headless-insight-quickview.js';
export {buildQuickview} from './controllers/insight/quickview/headless-insight-quickview.js';
export type {
  RecentQueriesList,
  RecentQueriesListInitialState,
  RecentQueriesListOptions,
  RecentQueriesListProps,
  RecentQueriesState,
} from './controllers/insight/recent-queries-list/headless-insight-recent-queries-list.js';
export {buildRecentQueriesList} from './controllers/insight/recent-queries-list/headless-insight-recent-queries-list.js';
export type {
  InsightInteractiveResultOptions,
  InsightInteractiveResultProps,
  InteractiveResult,
  InteractiveResultCore,
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
} from './controllers/insight/result-list/headless-insight-interactive-result.js';
export {buildInteractiveResult} from './controllers/insight/result-list/headless-insight-interactive-result.js';
export type {
  ResultList,
  ResultListOptions,
  ResultListProps,
  ResultListState,
} from './controllers/insight/result-list/headless-insight-result-list.js';
export {buildResultList} from './controllers/insight/result-list/headless-insight-result-list.js';
export type {
  ResultsPerPage,
  ResultsPerPageInitialState,
  ResultsPerPageProps,
  ResultsPerPageState,
} from './controllers/insight/results-per-page/headless-insight-results-per-page.js';
export {buildResultsPerPage} from './controllers/insight/results-per-page/headless-insight-results-per-page.js';
export type {
  Delimiters,
  SearchBox,
  SearchBoxOptions,
  SearchBoxProps,
  SearchBoxState,
  Suggestion,
  SuggestionHighlightingOptions,
} from './controllers/insight/search-box/headless-insight-search-box.js';
export {buildSearchBox} from './controllers/insight/search-box/headless-insight-search-box.js';
export type {
  SearchParameterManager,
  SearchParameterManagerInitialState,
  SearchParameterManagerProps,
  SearchParameterManagerState,
  SearchParameters,
} from './controllers/insight/search-parameter-manager/headless-insight-search-parameter-manager.js';
export {buildSearchParameterManager} from './controllers/insight/search-parameter-manager/headless-insight-search-parameter-manager.js';
export type {
  InlineLink,
  QuestionAnswerDocumentIdentifier,
  SmartSnippet,
  SmartSnippetCore,
  SmartSnippetOptions,
  SmartSnippetProps,
  SmartSnippetState,
} from './controllers/insight/smart-snippet/headless-insight-smart-snippet.js';
export {buildSmartSnippet} from './controllers/insight/smart-snippet/headless-insight-smart-snippet.js';
export type {
  CoreSmartSnippetQuestionsList,
  CoreSmartSnippetQuestionsListState,
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListOptions,
  SmartSnippetQuestionsListProps,
  SmartSnippetQuestionsListState,
  SmartSnippetRelatedQuestion,
} from './controllers/insight/smart-snippet-questions-list/headless-insight-smart-snippet-questions-list.js';
export {buildSmartSnippetQuestionsList} from './controllers/insight/smart-snippet-questions-list/headless-insight-smart-snippet-questions-list.js';
export type {
  Sort,
  SortInitialState,
  SortProps,
  SortState,
} from './controllers/insight/sort/headless-insight-sort.js';
export {buildSort} from './controllers/insight/sort/headless-insight-sort.js';
export type {
  SearchStatus,
  SearchStatusState,
} from './controllers/insight/status/headless-insight-status.js';
export {buildSearchStatus} from './controllers/insight/status/headless-insight-status.js';
export type {
  Tab,
  TabInitialState,
  TabOptions,
  TabProps,
  TabState,
} from './controllers/insight/tab/headless-insight-tab.js';
export {buildTab} from './controllers/insight/tab/headless-insight-tab.js';
export type {
  NotifyTrigger,
  NotifyTriggerState,
} from './controllers/insight/triggers/headless-insight-notify-trigger.js';
export {buildNotifyTrigger} from './controllers/insight/triggers/headless-insight-notify-trigger.js';
export type {
  UserAction,
  UserActions,
  UserActionsOptions,
  UserActionsProps,
  UserActionsState,
  UserSession,
} from './controllers/insight/user-actions/headless-user-actions.js';
export {buildUserActions} from './controllers/insight/user-actions/headless-user-actions.js';
export type {InsightInterface} from './controllers/insight-interface/insight-interface.js';
export {buildInsightInterface} from './controllers/insight-interface/insight-interface.js';
export * from './features/analytics/generic-analytics-actions-loader.js';
export * from './features/analytics/insight-analytics-actions-loader.js';
export * from './features/attached-results/attached-results-actions-loader.js';
export * from './features/attached-results/attached-results-analytics-actions-loader.js';
export * from './features/case-context/case-context-actions-loader.js';
export * from './features/context/context-actions-loader.js';
export type {
  CategoryFacetSortCriterion,
  CategoryFacetValueRequest,
} from './features/facets/category-facet-set/interfaces/request.js';
export type {
  FacetSortCriterion,
  FacetValueRequest,
} from './features/facets/facet-set/interfaces/request.js';
export * from './features/facets/range-facets/date-facet-set/date-facet-actions-loader.js';
export type {DateFacetValue} from './features/facets/range-facets/date-facet-set/interfaces/response.js';
export type {
  RangeFacetRangeAlgorithm,
  RangeFacetSortCriterion,
} from './features/facets/range-facets/generic/interfaces/request.js';
export type {NumericFacetValue} from './features/facets/range-facets/numeric-facet-set/interfaces/response.js';
export * from './features/facets/range-facets/numeric-facet-set/numeric-facet-actions-loader.js';
export * from './features/fields/fields-actions-loader.js';
export * from './features/folding/insight-folding-actions-loader.js';
export * from './features/generated-answer/generated-answer-actions-loader.js';
// Action loaders
export * from './features/insight-interface/insight-interface-actions-loader.js';
export type {InsightInterfaceState} from './features/insight-interface/insight-interface-state.js';
export * from './features/insight-search/insight-query-set-actions-loader.js';
export * from './features/insight-search/insight-search-actions-loader.js';
export * from './features/insight-search/insight-search-analytics-actions-loader.js';
export * from './features/insight-user-actions/insight-user-actions-loader.js';
export * from './features/query-suggest/query-suggest-actions-loader.js';
export * from './features/question-answering/question-answering-actions-loader.js';
export * from './features/recent-results/recent-results-actions-loader.js';
export {ResultTemplatesHelpers} from './features/result-templates/result-templates-helpers.js';
// Features
export type {
  ResultTemplate,
  ResultTemplateCondition,
  ResultTemplatesManager,
} from './features/result-templates/result-templates-manager.js';
export {buildResultTemplatesManager} from './features/result-templates/result-templates-manager.js';
export type {HighlightKeyword} from './utils/highlight.js';
export {HighlightUtils};

export {
  getAnalyticsNextApiBaseUrl,
  getOrganizationEndpoint,
} from './api/platform-client.js';

export type {
  RelativeDate,
  RelativeDatePeriod,
  RelativeDateUnit,
} from './api/search/date/relative-date.js';

export {deserializeRelativeDate} from './api/search/date/relative-date.js';
export {
  buildCriterionExpression,
  buildDateSortCriterion,
  buildRelevanceSortCriterion,
  SortOrder,
} from './features/sort-criteria/criteria.js';

export type {PlatformEnvironment} from './utils/url-utils.js';
