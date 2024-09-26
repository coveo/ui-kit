import * as HighlightUtils from './utils/highlight.js';

// 3rd Party Libraries
export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';
export type {AnalyticsClientSendEventHook} from 'coveo.analytics';
export type {Relay} from '@coveo/relay';

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
export type {NavigatorContext} from './app/navigatorContextProvider.js';

// State
export type {
  SearchParametersState,
  SearchAppState,
} from './state/search-app-state.js';

//#region Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller.js';
export {buildController} from './controllers/controller/headless-controller.js';

export type {
  RelevanceInspectorInitialState,
  RelevanceInspectorProps,
  RelevanceInspectorState,
  RelevanceInspector,
  DocumentWeights,
  ExecutionReport,
  ExecutionStep,
  QueryExpressions,
  QueryRankingExpressionWeights,
  QueryRankingExpression,
  ResultRankingInformation,
  RankingInformation,
  TermWeightReport,
  SecurityIdentity,
} from './controllers/relevance-inspector/headless-relevance-inspector.js';
export {buildRelevanceInspector} from './controllers/relevance-inspector/headless-relevance-inspector.js';

export type {
  Context,
  ContextInitialState,
  ContextProps,
  ContextState,
  ContextValue,
  ContextPayload,
} from './controllers/context/headless-context.js';
export {buildContext} from './controllers/context/headless-context.js';

export type {
  DictionaryFieldContext,
  DictionaryFieldContextState,
  DictionaryFieldContextPayload,
} from './controllers/dictionary-field-context/headless-dictionary-field-context.js';
export {buildDictionaryFieldContext} from './controllers/dictionary-field-context/headless-dictionary-field-context.js';

export type {
  DidYouMean,
  DidYouMeanState,
  QueryCorrection,
  WordCorrection,
  DidYouMeanProps,
  DidYouMeanOptions,
} from './controllers/did-you-mean/headless-did-you-mean.js';
export {buildDidYouMean} from './controllers/did-you-mean/headless-did-you-mean.js';

export type {
  CategoryFacetOptions,
  CategoryFacetSearchOptions,
  CategoryFacetProps,
  CategoryFacetState,
  CategoryFacet,
  CategoryFacetSearch,
  CategoryFacetSearchState,
  CategoryFacetSearchResult,
  CoreCategoryFacet,
  CoreCategoryFacetState,
} from './controllers/facets/category-facet/headless-category-facet.js';
export {buildCategoryFacet} from './controllers/facets/category-facet/headless-category-facet.js';

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
} from './controllers/facets/facet/headless-facet.js';
export {buildFacet} from './controllers/facets/facet/headless-facet.js';

export type {
  DateRangeOptions,
  DateRangeInput,
  DateFacetOptions,
  DateFacetProps,
  DateFacetState,
  DateFacet,
} from './controllers/facets/range-facet/date-facet/headless-date-facet.js';
export {
  buildDateRange,
  buildDateFacet,
} from './controllers/facets/range-facet/date-facet/headless-date-facet.js';

export type {
  NumericRangeOptions,
  NumericFacetOptions,
  NumericFacetProps,
  NumericFacetState,
  NumericFacet,
} from './controllers/facets/range-facet/numeric-facet/headless-numeric-facet.js';
export {
  buildNumericRange,
  buildNumericFacet,
} from './controllers/facets/range-facet/numeric-facet/headless-numeric-facet.js';

export type {
  NumericFilter,
  NumericFilterOptions,
  NumericFilterProps,
  NumericFilterRange,
  NumericFilterState,
  NumericFilterInitialState,
} from './controllers/facets/range-facet/numeric-facet/headless-numeric-filter.js';
export {buildNumericFilter} from './controllers/facets/range-facet/numeric-facet/headless-numeric-filter.js';

export type {
  DateFilter,
  DateFilterOptions,
  DateFilterProps,
  DateFilterRange,
  DateFilterState,
  DateFilterInitialState,
} from './controllers/facets/range-facet/date-facet/headless-date-filter.js';
export {buildDateFilter} from './controllers/facets/range-facet/date-facet/headless-date-filter.js';

export type {
  HistoryManager,
  HistoryManagerState,
} from './controllers/history-manager/headless-history-manager.js';
export {buildHistoryManager} from './controllers/history-manager/headless-history-manager.js';

export type {
  PagerInitialState,
  PagerOptions,
  PagerProps,
  PagerState,
  Pager,
} from './controllers/pager/headless-pager.js';
export {buildPager} from './controllers/pager/headless-pager.js';

export type {
  QueryError,
  QueryErrorState,
} from './controllers/query-error/headless-query-error.js';
export {buildQueryError} from './controllers/query-error/headless-query-error.js';

export type {
  QuerySummaryState,
  QuerySummary,
} from './controllers/query-summary/headless-query-summary.js';
export {buildQuerySummary} from './controllers/query-summary/headless-query-summary.js';

export type {
  ResultListProps,
  ResultListOptions,
  ResultListState,
  ResultList,
} from './controllers/result-list/headless-result-list.js';
export {buildResultList} from './controllers/result-list/headless-result-list.js';

export type {
  InteractiveResultOptions,
  InteractiveResultProps,
  InteractiveResult,
} from './controllers/result-list/headless-interactive-result.js';
export {buildInteractiveResult} from './controllers/result-list/headless-interactive-result.js';

export type {
  InteractiveInstantResultOptions,
  InteractiveInstantResultProps,
  InteractiveInstantResult,
} from './controllers/instant-results/headless-interactive-instant-result.js';
export {buildInteractiveInstantResult} from './controllers/instant-results/headless-interactive-instant-result.js';

export type {
  ResultsPerPageInitialState,
  ResultsPerPageProps,
  ResultsPerPageState,
  ResultsPerPage,
} from './controllers/results-per-page/headless-results-per-page.js';
export {buildResultsPerPage} from './controllers/results-per-page/headless-results-per-page.js';

export type {
  SearchBoxOptions,
  SearchBoxProps,
  SearchBoxState,
  SearchBox,
  Suggestion,
  SuggestionHighlightingOptions,
  Delimiters,
} from './controllers/search-box/headless-search-box.js';
export {buildSearchBox} from './controllers/search-box/headless-search-box.js';

export type {
  InstantResults,
  InstantResultsState,
  InstantResultProps,
  InstantResultOptions,
} from './controllers/instant-results/instant-results.js';
export {buildInstantResults} from './controllers/instant-results/instant-results.js';

export type {
  SortInitialState,
  SortProps,
  SortState,
  Sort,
} from './controllers/sort/headless-sort.js';
export {buildSort} from './controllers/sort/headless-sort.js';

export type {
  StaticFilterValueOptions,
  StaticFilter,
  StaticFilterOptions,
  StaticFilterProps,
  StaticFilterState,
  StaticFilterValue,
  StaticFilterValueState,
} from './controllers/static-filter/headless-static-filter.js';
export {
  buildStaticFilterValue,
  buildStaticFilter,
} from './controllers/static-filter/headless-static-filter.js';

export type {
  TabInitialState,
  TabOptions,
  TabProps,
  TabState,
  Tab,
} from './controllers/tab/headless-tab.js';
export {buildTab} from './controllers/tab/headless-tab.js';

export type {
  TabManagerState,
  TabManager,
} from './controllers/tab-manager/headless-tab-manager.js';
export {buildTabManager} from './controllers/tab-manager/headless-tab-manager.js';

export type {
  FacetManagerPayload,
  FacetManagerState,
  FacetManager,
} from './controllers/facet-manager/headless-facet-manager.js';
export {buildFacetManager} from './controllers/facet-manager/headless-facet-manager.js';

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
  AutomaticFacetBreadcrumb,
  CoreBreadcrumbManager,
  CoreBreadcrumbManagerState,
} from './controllers/breadcrumb-manager/headless-breadcrumb-manager.js';
export {buildBreadcrumbManager} from './controllers/breadcrumb-manager/headless-breadcrumb-manager.js';

export type {
  StandaloneSearchBoxOptions,
  StandaloneSearchBoxAnalytics,
  StandaloneSearchBoxProps,
  StandaloneSearchBoxState,
  StandaloneSearchBox,
} from './controllers/standalone-search-box/headless-standalone-search-box.js';
export {buildStandaloneSearchBox} from './controllers/standalone-search-box/headless-standalone-search-box.js';

export type {
  SearchParameterManagerProps,
  SearchParameterManagerInitialState,
  SearchParameterManagerState,
  SearchParameterManager,
  SearchParameters,
} from './controllers/search-parameter-manager/headless-search-parameter-manager.js';
export {buildSearchParameterManager} from './controllers/search-parameter-manager/headless-search-parameter-manager.js';

export type {
  UrlManagerProps,
  UrlManagerInitialState,
  UrlManagerState,
  UrlManager,
} from './controllers/url-manager/headless-url-manager.js';
export {buildUrlManager} from './controllers/url-manager/headless-url-manager.js';

export type {
  SearchStatus,
  SearchStatusState,
} from './controllers/search-status/headless-search-status.js';
export {buildSearchStatus} from './controllers/search-status/headless-search-status.js';

export type {ErrorPayload} from './controllers/controller/error-payload.js';

export type {
  Quickview,
  QuickviewOptions,
  QuickviewProps,
  QuickviewState,
  CoreQuickviewState,
  CoreQuickview,
} from './controllers/quickview/headless-quickview.js';
export {buildQuickview} from './controllers/quickview/headless-quickview.js';

export type {
  FoldingOptions,
  FoldedCollection,
  FoldedResult,
  FoldedResultListOptions,
  FoldedResultListProps,
  FoldedResultList,
  FoldedResultListState,
} from './controllers/folded-result-list/headless-folded-result-list.js';
export {buildFoldedResultList} from './controllers/folded-result-list/headless-folded-result-list.js';

export type {
  RedirectionTrigger,
  RedirectionTriggerState,
} from './controllers/core/triggers/headless-core-redirection-trigger.js';
export {buildRedirectionTrigger} from './controllers/triggers/headless-redirection-trigger.js';

export type {
  QueryTrigger,
  QueryTriggerState,
} from './controllers/core/triggers/headless-core-query-trigger.js';
export {buildQueryTrigger} from './controllers/triggers/headless-query-trigger.js';

export type {
  ExecuteTrigger,
  ExecuteTriggerState,
} from './controllers/triggers/headless-execute-trigger.js';
export {buildExecuteTrigger} from './controllers/triggers/headless-execute-trigger.js';

export type {ExecuteTriggerParams} from './api/common/trigger.js';

export type {
  NotifyTrigger,
  NotifyTriggerState,
} from './controllers/core/triggers/headless-core-notify-trigger.js';
export {buildNotifyTrigger} from './controllers/triggers/headless-notify-trigger.js';

export type {
  SmartSnippet,
  SmartSnippetOptions,
  SmartSnippetProps,
  SmartSnippetState,
  QuestionAnswerDocumentIdentifier,
  SmartSnippetCore,
} from './controllers/smart-snippet/headless-smart-snippet.js';
export {buildSmartSnippet} from './controllers/smart-snippet/headless-smart-snippet.js';

export type {InlineLink} from './controllers/smart-snippet/headless-smart-snippet-interactive-inline-links.js';

export type {
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListOptions,
  SmartSnippetQuestionsListProps,
  SmartSnippetQuestionsListState,
  SmartSnippetRelatedQuestion,
  CoreSmartSnippetQuestionsList,
  CoreSmartSnippetQuestionsListState,
} from './controllers/smart-snippet-questions-list/headless-smart-snippet-questions-list.js';
export {buildSmartSnippetQuestionsList} from './controllers/smart-snippet-questions-list/headless-smart-snippet-questions-list.js';

export type {
  RecentQueriesListInitialState,
  RecentQueriesList,
  RecentQueriesState,
  RecentQueriesListProps,
  RecentQueriesListOptions,
} from './controllers/recent-queries-list/headless-recent-queries-list.js';
export {buildRecentQueriesList} from './controllers/recent-queries-list/headless-recent-queries-list.js';

export type {
  RecentResultsListInitialState,
  RecentResultsList,
  RecentResultsState,
  RecentResultsListProps,
  RecentResultsListOptions,
} from './controllers/recent-results-list/headless-recent-results-list.js';
export {buildRecentResultsList} from './controllers/recent-results-list/headless-recent-results-list.js';

export type {
  InteractiveRecentResult,
  InteractiveRecentResultProps,
  InteractiveRecentResultOptions,
} from './controllers/recent-results-list/headless-interactive-recent-result.js';
export {buildInteractiveRecentResult} from './controllers/recent-results-list/headless-interactive-recent-result.js';

export type {
  InteractiveResultCore,
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
} from './controllers/core/interactive-result/headless-core-interactive-result.js';

export type {
  FacetConditionsManager,
  AnyFacetValuesCondition,
} from './controllers/core/facets/facet-conditions-manager/headless-facet-conditions-manager.js';
export {buildCoreFacetConditionsManager as buildFacetConditionsManager} from './controllers/core/facets/facet-conditions-manager/headless-facet-conditions-manager.js';

export type {
  FieldSuggestionsValue,
  FieldSuggestionsState,
  FieldSuggestions,
  FieldSuggestionsOptions,
  FieldSuggestionsProps,
} from './controllers/field-suggestions/facet/headless-field-suggestions.js';
export {buildFieldSuggestions} from './controllers/field-suggestions/facet/headless-field-suggestions.js';

export type {
  CategoryFieldSuggestionsValue,
  CategoryFieldSuggestionsState,
  CategoryFieldSuggestions,
  CategoryFieldSuggestionsOptions,
  CategoryFieldSuggestionsProps,
} from './controllers/field-suggestions/category-facet/headless-category-field-suggestions.js';

export {buildCategoryFieldSuggestions} from './controllers/field-suggestions/category-facet/headless-category-field-suggestions.js';

export type {
  AutomaticFacet,
  AutomaticFacetState,
  AutomaticFacetGenerator,
  AutomaticFacetGeneratorProps,
  AutomaticFacetGeneratorState,
  AutomaticFacetGeneratorOptions,
} from './controllers/facets/automatic-facet-generator/headless-automatic-facet-generator.js';
export {buildAutomaticFacetGenerator} from './controllers/facets/automatic-facet-generator/headless-automatic-facet-generator.js';

export type {
  GeneratedAnswer,
  GeneratedAnswerState,
  GeneratedAnswerProps,
  GeneratedAnswerCitation,
  GeneratedResponseFormat,
  GeneratedAnswerPropsInitialState,
} from './controllers/generated-answer/headless-generated-answer.js';
export {buildGeneratedAnswer} from './controllers/generated-answer/headless-generated-answer.js';

export type {
  InteractiveCitationOptions,
  InteractiveCitationProps,
  InteractiveCitation,
} from './controllers/generated-answer/headless-interactive-citation.js';
export {buildInteractiveCitation} from './controllers/generated-answer/headless-interactive-citation.js';
//#endregion

//#endregion

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

//#region Grouped actions
export {ResultTemplatesHelpers} from './features/result-templates/result-templates-helpers.js';
export * from './features/advanced-search-queries/advanced-search-queries-actions-loader.js';
export * from './features/facets/category-facet-set/category-facet-set-actions-loader.js';
export * from './features/facets/facet-set/facet-set-actions-loader.js';
export * from './features/configuration/configuration-actions-loader.js';
export * from './features/configuration/search-configuration-actions-loader.js';
export * from './features/context/context-actions-loader.js';
export * from './features/dictionary-field-context/dictionary-field-context-actions-loader.js';
export * from './features/debug/debug-actions-loader.js';
export * from './features/facets/range-facets/date-facet-set/date-facet-actions-loader.js';
export * from './features/facet-options/facet-options-actions-loader.js';
export * from './features/did-you-mean/did-you-mean-actions-loader.js';
export * from './features/fields/fields-actions-loader.js';
export * from './features/history/history-actions-loader.js';
export * from './features/facets/range-facets/numeric-facet-set/numeric-facet-actions-loader.js';
export * from './features/folding/folding-actions-loader.js';
export * from './features/pagination/pagination-actions-loader.js';
export * from './features/pipeline/pipeline-actions-loader.js';
export * from './features/query/query-actions-loader.js';
export * from './features/query-set/query-set-actions-loader.js';
export * from './features/instant-results/instant-results-actions-loader.js';
export * from './features/query-suggest/query-suggest-actions-loader.js';
export * from './features/search/search-actions-loader.js';
export * from './features/search-hub/search-hub-actions-loader.js';
export * from './features/sort-criteria/sort-criteria-actions-loader.js';
export * from './features/standalone-search-box-set/standalone-search-box-set-actions-loader.js';
export * from './features/static-filter-set/static-filter-set-actions-loader.js';
export * from './features/tab-set/tab-set-actions-loader.js';
export * from './features/question-answering/question-answering-actions-loader.js';
export * from './features/breadcrumb/breadcrumb-actions-loader.js';
export * from './features/recent-queries/recent-queries-actions-loader.js';
export * from './features/recent-results/recent-results-actions-loader.js';
export * from './features/excerpt-length/excerpt-length-actions-loader.js';
export * from './features/result-preview/result-preview-actions-loader.js';
export * from './features/generated-answer/generated-answer-actions-loader.js';
export {buildResultTemplatesManager} from './features/result-templates/result-templates-manager.js';
//#endregion
// Analytics Actions
export * from './features/analytics/search-analytics-actions-loader.js';
export * from './features/analytics/click-analytics-actions-loader.js';
export * from './features/analytics/generic-analytics-actions-loader.js';
export * from './features/actions-history/ipx-actions-history-actions-loader.js';

// Types & Helpers
export {
  getOrganizationEndpoint,
  getSearchApiBaseUrl,
  getAnalyticsNextApiBaseUrl,
} from './api/platform-client.js';
export {API_DATE_FORMAT} from './api/search/date/date-format.js';
export {HighlightUtils};
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
export type {
  ResultTemplatesManager,
  ResultTemplate,
  ResultTemplateCondition,
} from './features/result-templates/result-templates-manager.js';
export type {
  TemplatesManager,
  Template,
} from './features/templates/templates-manager.js';
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
export type {GeneratedContentFormat} from './features/generated-answer/generated-response-format.js';

export * from './utils/query-expression/query-expression.js';

export type {
  GeneratedAnswerFeedback,
  GeneratedAnswerFeedbackOption,
} from './features/generated-answer/generated-answer-analytics-actions.js';
