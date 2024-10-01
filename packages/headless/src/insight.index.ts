import * as HighlightUtils from './utils/highlight.js';

// 3rd Party Libraries
export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';
export type {Relay} from '@coveo/relay';

// Main App
export type {
  InsightEngine,
  InsightEngineOptions,
  InsightEngineConfiguration,
  InsightEngineSearchConfigurationOptions,
} from './app/insight-engine/insight-engine.js';
export {
  buildInsightEngine,
  getSampleInsightEngineConfiguration,
} from './app/insight-engine/insight-engine.js';

export type {CoreEngine, ExternalEngineOptions} from './app/engine.js';
export type {
  EngineConfiguration,
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
} from './app/engine-configuration.js';
export type {LoggerOptions} from './app/logger.js';

export type {LogLevel} from './app/logger.js';
export type {NavigatorContext} from './app/navigatorContextProvider.js';

// Action loaders
export * from './features/insight-interface/insight-interface-actions-loader.js';
export * from './features/insight-search/insight-search-actions-loader.js';
export * from './features/insight-search/insight-query-set-actions-loader.js';
export * from './features/analytics/insight-analytics-actions-loader.js';
export * from './features/facets/range-facets/date-facet-set/date-facet-actions-loader.js';
export * from './features/facets/range-facets/numeric-facet-set/numeric-facet-actions-loader.js';
export * from './features/recent-results/recent-results-actions-loader.js';
export * from './features/facets/range-facets/date-facet-set/date-facet-actions-loader.js';
export * from './features/case-context/case-context-actions-loader.js';
export * from './features/context/context-actions-loader.js';
export * from './features/insight-search/insight-search-analytics-actions-loader.js';
export * from './features/fields/fields-actions-loader.js';
export * from './features/attached-results/attached-results-actions-loader.js';
export * from './features/analytics/generic-analytics-actions-loader.js';
export * from './features/question-answering/question-answering-actions-loader.js';
export * from './features/folding/folding-actions-loader.js';
export * from './features/insight-user-actions/insight-user-actions-loader.js';
export * from './features/query-suggest/query-suggest-actions-loader.js';

// Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller.js';
export {buildController} from './controllers/controller/headless-controller.js';

export type {HighlightKeyword} from './utils/highlight.js';

export type {
  DidYouMean,
  DidYouMeanState,
  QueryCorrection,
  WordCorrection,
} from './controllers/insight/did-you-mean/headless-insight-did-you-mean.js';
export {buildDidYouMean} from './controllers/insight/did-you-mean/headless-insight-did-you-mean.js';

export type {
  NumericFacetBreadcrumb,
  FacetBreadcrumb,
  DateFacetBreadcrumb,
  CategoryFacetBreadcrumb,
  StaticFilterBreadcrumb,
  Breadcrumb,
  BreadcrumbValue,
  BreadcrumbManagerState,
  BreadcrumbManager,
  DeselectableValue,
} from './controllers/insight/breadcrumb-manager/headless-insight-breadcrumb-manager.js';
export {buildBreadcrumbManager} from './controllers/insight/breadcrumb-manager/headless-insight-breadcrumb-manager.js';

export type {
  SearchParameterManagerProps,
  SearchParameterManagerInitialState,
  SearchParameterManagerState,
  SearchParameterManager,
  SearchParameters,
} from './controllers/insight/search-parameter-manager/headless-insight-search-parameter-manager.js';
export {buildSearchParameterManager} from './controllers/insight/search-parameter-manager/headless-insight-search-parameter-manager.js';

export type {
  FacetManagerPayload,
  FacetManagerState,
  FacetManager,
} from './controllers/insight/facet-manager/headless-insight-facet-manager.js';
export {buildFacetManager} from './controllers/insight/facet-manager/headless-insight-facet-manager.js';

export type {
  CategoryFacetValueRequest,
  CategoryFacetSortCriterion,
} from './features/facets/category-facet-set/interfaces/request.js';

export type {
  CategoryFacetOptions,
  CategoryFacetSearchOptions,
  CategoryFacetProps,
  CategoryFacetState,
  CategoryFacet,
  CategoryFacetValue,
  CategoryFacetValueCommon,
  CategoryFacetSearch,
  CategoryFacetSearchState,
  CategoryFacetSearchResult,
  CoreCategoryFacet,
  CoreCategoryFacetState,
} from './controllers/insight/facets/category-facet/headless-insight-category-facet.js';
export {buildCategoryFacet} from './controllers/insight/facets/category-facet/headless-insight-category-facet.js';

export type {
  FacetOptions,
  FacetSearchOptions,
  FacetProps,
  FacetState,
  Facet,
  FacetValue,
  FacetValueState,
  FacetSearch,
  FacetSearchState,
  SpecificFacetSearchResult,
  CoreFacet,
  CoreFacetState,
  CoreFacetOptions,
} from './controllers/insight/facets/facet/headless-insight-facet.js';
export {buildFacet} from './controllers/insight/facets/facet/headless-insight-facet.js';

export type {
  DateRangeOptions,
  DateRangeRequest,
  DateRangeInput,
  DateFacetOptions,
  DateFacetProps,
  DateFacetState,
  DateFacet,
} from './controllers/insight/facets/range-facet/date-facet/headless-insight-date-facet.js';
export {
  buildDateRange,
  buildDateFacet,
} from './controllers/insight/facets/range-facet/date-facet/headless-insight-date-facet.js';

export type {
  NumericRangeOptions,
  NumericRangeRequest,
  NumericFacetOptions,
  NumericFacetProps,
  NumericFacetState,
  NumericFacet,
} from './controllers/insight/facets/range-facet/numeric-facet/headless-insight-numeric-facet.js';
export {
  buildNumericRange,
  buildNumericFacet,
} from './controllers/insight/facets/range-facet/numeric-facet/headless-insight-numeric-facet.js';

export type {
  NumericFilter,
  NumericFilterOptions,
  NumericFilterProps,
  NumericFilterRange,
  NumericFilterState,
  NumericFilterInitialState,
} from './controllers/insight/facets/range-facet/numeric-facet/headless-insight-numeric-filter.js';
export {buildNumericFilter} from './controllers/insight/facets/range-facet/numeric-facet/headless-insight-numeric-filter.js';

export type {
  DateFilter,
  DateFilterOptions,
  DateFilterProps,
  DateFilterRange,
  DateFilterState,
  DateFilterInitialState,
} from './controllers/insight/facets/range-facet/date-facet/headless-insight-date-filter.js';
export {buildDateFilter} from './controllers/insight/facets/range-facet/date-facet/headless-insight-date-filter.js';

export type {
  PagerInitialState,
  PagerOptions,
  PagerProps,
  PagerState,
  Pager,
} from './controllers/insight/pager/headless-insight-pager.js';
export {buildPager} from './controllers/insight/pager/headless-insight-pager.js';

export type {
  AttachToCaseProps,
  AttachToCaseOptions,
  AttachToCase,
} from './controllers/insight/attach-to-case/headless-attach-to-case.js';
export {buildAttachToCase} from './controllers/insight/attach-to-case/headless-attach-to-case.js';

export type {
  QuerySummaryState,
  QuerySummary,
} from './controllers/insight/query-summary/headless-insight-query-summary.js';
export {buildQuerySummary} from './controllers/insight/query-summary/headless-insight-query-summary.js';

export type {
  QuickviewProps,
  QuickviewOptions,
  QuickviewState,
  Quickview,
} from './controllers/insight/quickview/headless-insight-quickview.js';
export {buildQuickview} from './controllers/insight/quickview/headless-insight-quickview.js';

export type {
  ResultListProps,
  ResultListOptions,
  ResultListState,
  ResultList,
} from './controllers/insight/result-list/headless-insight-result-list.js';
export {buildResultList} from './controllers/insight/result-list/headless-insight-result-list.js';

export type {
  FoldingOptions,
  FoldedCollection,
  FoldedResult,
  FoldedResultListOptions,
  InsightFoldedResultListProps,
  FoldedResultList,
  FoldedResultListState,
} from './controllers/insight/folded-result-list/headless-insight-folded-result-list.js';
export {buildFoldedResultList} from './controllers/insight/folded-result-list/headless-insight-folded-result-list.js';

export type {
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
  InteractiveResultCore,
  InsightInteractiveResultOptions,
  InsightInteractiveResultProps,
  InteractiveResult,
} from './controllers/insight/result-list/headless-insight-interactive-result.js';
export {buildInteractiveResult} from './controllers/insight/result-list/headless-insight-interactive-result.js';

export type {
  ResultsPerPageInitialState,
  ResultsPerPageProps,
  ResultsPerPageState,
  ResultsPerPage,
} from './controllers/insight/results-per-page/headless-insight-results-per-page.js';
export {buildResultsPerPage} from './controllers/insight/results-per-page/headless-insight-results-per-page.js';

export type {
  SearchBoxOptions,
  SearchBoxProps,
  SearchBoxState,
  SearchBox,
  Suggestion,
  SuggestionHighlightingOptions,
  Delimiters,
} from './controllers/insight/search-box/headless-insight-search-box.js';
export {buildSearchBox} from './controllers/insight/search-box/headless-insight-search-box.js';

export type {
  SearchStatus,
  SearchStatusState,
} from './controllers/insight/status/headless-insight-status.js';
export {buildSearchStatus} from './controllers/insight/status/headless-insight-status.js';

export type {
  SortInitialState,
  SortProps,
  SortState,
  Sort,
} from './controllers/insight/sort/headless-insight-sort.js';
export {buildSort} from './controllers/insight/sort/headless-insight-sort.js';

export type {
  TabInitialState,
  TabOptions,
  TabProps,
  TabState,
  Tab,
} from './controllers/insight/tab/headless-insight-tab.js';
export {buildTab} from './controllers/insight/tab/headless-insight-tab.js';

export type {
  FacetConditionsManager,
  FacetConditionsManagerProps,
  AnyFacetValuesCondition,
} from './controllers/insight/facet-conditions-manager/headless-facet-conditions-manager.js';
export {buildFacetConditionsManager} from './controllers/insight/facet-conditions-manager/headless-facet-conditions-manager.js';

export type {InsightInterfaceState} from './features/insight-interface/insight-interface-state.js';

export type {InsightInterface} from './controllers/insight-interface/insight-interface.js';
export {buildInsightInterface} from './controllers/insight-interface/insight-interface.js';

export type {
  InlineLink,
  SmartSnippet,
  SmartSnippetOptions,
  SmartSnippetProps,
  SmartSnippetState,
  QuestionAnswerDocumentIdentifier,
  SmartSnippetCore,
} from './controllers/insight/smart-snippet/headless-insight-smart-snippet.js';
export {buildSmartSnippet} from './controllers/insight/smart-snippet/headless-insight-smart-snippet.js';

export type {
  SmartSnippetQuestionsListOptions,
  SmartSnippetQuestionsListProps,
  SmartSnippetQuestionsListState,
  SmartSnippetQuestionsList,
  SmartSnippetRelatedQuestion,
  CoreSmartSnippetQuestionsList,
  CoreSmartSnippetQuestionsListState,
} from './controllers/insight/smart-snippet-questions-list/headless-insight-smart-snippet-questions-list.js';
export {buildSmartSnippetQuestionsList} from './controllers/insight/smart-snippet-questions-list/headless-insight-smart-snippet-questions-list.js';

export type {
  GeneratedAnswer,
  GeneratedAnswerState,
  GeneratedAnswerProps,
} from './controllers/insight/generated-answer/headless-insight-generated-answer.js';
export {buildGeneratedAnswer} from './controllers/insight/generated-answer/headless-insight-generated-answer.js';

export type {
  InteractiveCitation,
  InteractiveCitationProps,
  InteractiveCitationOptions,
} from './controllers/insight/generated-answer/headless-insight-interactive-citation.js';
export {buildInteractiveCitation} from './controllers/insight/generated-answer/headless-insight-interactive-citation.js';

export type {
  UserActionsState,
  UserActionsProps,
  UserActionsOptions,
  UserActions,
  UserAction,
  UserSession,
} from './controllers/insight/user-actions/headless-user-actions.js';
export {buildUserActions} from './controllers/insight/user-actions/headless-user-actions.js';

// Features
export type {
  ResultTemplate,
  ResultTemplateCondition,
} from './features/result-templates/result-templates-manager.js';
export type {ResultTemplatesManager} from './features/result-templates/result-templates-manager.js';
export {buildResultTemplatesManager} from './features/result-templates/result-templates-manager.js';
export {ResultTemplatesHelpers} from './features/result-templates/result-templates-helpers.js';

export type {NumericFacetValue} from './features/facets/range-facets/numeric-facet-set/interfaces/response.js';

export type {DateFacetValue} from './features/facets/range-facets/date-facet-set/interfaces/response.js';

export type {
  QueryError,
  QueryErrorState,
} from './controllers/insight/query-error/headless-insight-query-error.js';
export {buildQueryError} from './controllers/insight/query-error/headless-insight-query-error.js';

export type {
  FacetValueRequest,
  FacetSortCriterion,
} from './features/facets/facet-set/interfaces/request.js';

export type {
  RangeFacetSortCriterion,
  RangeFacetRangeAlgorithm,
} from './features/facets/range-facets/generic/interfaces/request.js';

// Types & Helpers
export type {Raw} from './api/search/search/raw.js';
export type {InsightAPIErrorStatusResponse} from './api/service/insight/insight-api-client.js';
export type {Result} from './api/search/search/result.js';
export {HighlightUtils};

export {
  SortOrder,
  buildDateSortCriterion,
  buildCriterionExpression,
  buildRelevanceSortCriterion,
} from './features/sort-criteria/criteria.js';

export type {
  RelativeDate,
  RelativeDatePeriod,
  RelativeDateUnit,
} from './api/search/date/relative-date.js';

export {deserializeRelativeDate} from './api/search/date/relative-date.js';

export {
  getOrganizationEndpoint,
  getAnalyticsNextApiBaseUrl,
} from './api/platform-client.js';

export type {PlatformEnvironment} from './utils/url-utils.js';
