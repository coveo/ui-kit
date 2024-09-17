import * as HighlightUtils from './utils/highlight';

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
export type {NavigatorContext} from './app/navigatorContextProvider';

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
export {buildController} from './controllers/controller/headless-controller';

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
} from './controllers/relevance-inspector/headless-relevance-inspector';
export {buildRelevanceInspector} from './controllers/relevance-inspector/headless-relevance-inspector';

export type {
  Context,
  ContextInitialState,
  ContextProps,
  ContextState,
  ContextValue,
  ContextPayload,
} from './controllers/context/headless-context';
export {buildContext} from './controllers/context/headless-context';

export type {
  DictionaryFieldContext,
  DictionaryFieldContextState,
  DictionaryFieldContextPayload,
} from './controllers/dictionary-field-context/headless-dictionary-field-context';
export {buildDictionaryFieldContext} from './controllers/dictionary-field-context/headless-dictionary-field-context';

export type {
  DidYouMean,
  DidYouMeanState,
  QueryCorrection,
  WordCorrection,
  DidYouMeanProps,
  DidYouMeanOptions,
} from './controllers/did-you-mean/headless-did-you-mean';
export {buildDidYouMean} from './controllers/did-you-mean/headless-did-you-mean';

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
} from './controllers/facets/category-facet/headless-category-facet';
export {buildCategoryFacet} from './controllers/facets/category-facet/headless-category-facet';

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
} from './controllers/facets/facet/headless-facet';
export {buildFacet} from './controllers/facets/facet/headless-facet';

export type {
  DateRangeOptions,
  DateRangeInput,
  DateFacetOptions,
  DateFacetProps,
  DateFacetState,
  DateFacet,
} from './controllers/facets/range-facet/date-facet/headless-date-facet';
export {
  buildDateRange,
  buildDateFacet,
} from './controllers/facets/range-facet/date-facet/headless-date-facet';

export type {
  NumericRangeOptions,
  NumericFacetOptions,
  NumericFacetProps,
  NumericFacetState,
  NumericFacet,
} from './controllers/facets/range-facet/numeric-facet/headless-numeric-facet';
export {
  buildNumericRange,
  buildNumericFacet,
} from './controllers/facets/range-facet/numeric-facet/headless-numeric-facet';

export type {
  NumericFilter,
  NumericFilterOptions,
  NumericFilterProps,
  NumericFilterRange,
  NumericFilterState,
  NumericFilterInitialState,
} from './controllers/facets/range-facet/numeric-facet/headless-numeric-filter';
export {buildNumericFilter} from './controllers/facets/range-facet/numeric-facet/headless-numeric-filter';

export type {
  DateFilter,
  DateFilterOptions,
  DateFilterProps,
  DateFilterRange,
  DateFilterState,
  DateFilterInitialState,
} from './controllers/facets/range-facet/date-facet/headless-date-filter';
export {buildDateFilter} from './controllers/facets/range-facet/date-facet/headless-date-filter';

export type {
  HistoryManager,
  HistoryManagerState,
} from './controllers/history-manager/headless-history-manager';
export {buildHistoryManager} from './controllers/history-manager/headless-history-manager';

export type {
  PagerInitialState,
  PagerOptions,
  PagerProps,
  PagerState,
  Pager,
} from './controllers/pager/headless-pager';
export {buildPager} from './controllers/pager/headless-pager';

export type {
  QueryError,
  QueryErrorState,
} from './controllers/query-error/headless-query-error';
export {buildQueryError} from './controllers/query-error/headless-query-error';

export type {
  QuerySummaryState,
  QuerySummary,
} from './controllers/query-summary/headless-query-summary';
export {buildQuerySummary} from './controllers/query-summary/headless-query-summary';

export type {
  ResultListProps,
  ResultListOptions,
  ResultListState,
  ResultList,
} from './controllers/result-list/headless-result-list';
export {buildResultList} from './controllers/result-list/headless-result-list';

export type {
  InteractiveResultOptions,
  InteractiveResultProps,
  InteractiveResult,
} from './controllers/result-list/headless-interactive-result';
export {buildInteractiveResult} from './controllers/result-list/headless-interactive-result';

export type {
  InteractiveInstantResultOptions,
  InteractiveInstantResultProps,
  InteractiveInstantResult,
} from './controllers/instant-results/headless-interactive-instant-result';
export {buildInteractiveInstantResult} from './controllers/instant-results/headless-interactive-instant-result';

export type {
  ResultsPerPageInitialState,
  ResultsPerPageProps,
  ResultsPerPageState,
  ResultsPerPage,
} from './controllers/results-per-page/headless-results-per-page';
export {buildResultsPerPage} from './controllers/results-per-page/headless-results-per-page';

export type {
  SearchBoxOptions,
  SearchBoxProps,
  SearchBoxState,
  SearchBox,
  Suggestion,
  SuggestionHighlightingOptions,
  Delimiters,
} from './controllers/search-box/headless-search-box';
export {buildSearchBox} from './controllers/search-box/headless-search-box';

export type {
  InstantResults,
  InstantResultsState,
  InstantResultProps,
  InstantResultOptions,
} from './controllers/instant-results/instant-results';
export {buildInstantResults} from './controllers/instant-results/instant-results';

export type {
  SortInitialState,
  SortProps,
  SortState,
  Sort,
} from './controllers/sort/headless-sort';
export {buildSort} from './controllers/sort/headless-sort';

export type {
  StaticFilterValueOptions,
  StaticFilter,
  StaticFilterOptions,
  StaticFilterProps,
  StaticFilterState,
  StaticFilterValue,
  StaticFilterValueState,
} from './controllers/static-filter/headless-static-filter';
export {
  buildStaticFilterValue,
  buildStaticFilter,
} from './controllers/static-filter/headless-static-filter';

export type {
  TabInitialState,
  TabOptions,
  TabProps,
  TabState,
  Tab,
} from './controllers/tab/headless-tab';
export {buildTab} from './controllers/tab/headless-tab';

export type {
  TabManagerState,
  TabManager,
} from './controllers/tab-manager/headless-tab-manager';
export {buildTabManager} from './controllers/tab-manager/headless-tab-manager';

export type {
  FacetManagerPayload,
  FacetManagerState,
  FacetManager,
} from './controllers/facet-manager/headless-facet-manager';
export {buildFacetManager} from './controllers/facet-manager/headless-facet-manager';

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
} from './controllers/breadcrumb-manager/headless-breadcrumb-manager';
export {buildBreadcrumbManager} from './controllers/breadcrumb-manager/headless-breadcrumb-manager';

export type {
  StandaloneSearchBoxOptions,
  StandaloneSearchBoxAnalytics,
  StandaloneSearchBoxProps,
  StandaloneSearchBoxState,
  StandaloneSearchBox,
} from './controllers/standalone-search-box/headless-standalone-search-box';
export {buildStandaloneSearchBox} from './controllers/standalone-search-box/headless-standalone-search-box';

export type {
  SearchParameterManagerProps,
  SearchParameterManagerInitialState,
  SearchParameterManagerState,
  SearchParameterManager,
  SearchParameters,
} from './controllers/search-parameter-manager/headless-search-parameter-manager';
export {buildSearchParameterManager} from './controllers/search-parameter-manager/headless-search-parameter-manager';

export type {
  UrlManagerProps,
  UrlManagerInitialState,
  UrlManagerState,
  UrlManager,
} from './controllers/url-manager/headless-url-manager';
export {buildUrlManager} from './controllers/url-manager/headless-url-manager';

export type {
  SearchStatus,
  SearchStatusState,
} from './controllers/search-status/headless-search-status';
export {buildSearchStatus} from './controllers/search-status/headless-search-status';

export type {ErrorPayload} from './controllers/controller/error-payload';

export type {
  Quickview,
  QuickviewOptions,
  QuickviewProps,
  QuickviewState,
  CoreQuickviewState,
  CoreQuickview,
} from './controllers/quickview/headless-quickview';
export {buildQuickview} from './controllers/quickview/headless-quickview';

export type {
  FoldingOptions,
  FoldedCollection,
  FoldedResult,
  FoldedResultListOptions,
  FoldedResultListProps,
  FoldedResultList,
  FoldedResultListState,
} from './controllers/folded-result-list/headless-folded-result-list';
export {buildFoldedResultList} from './controllers/folded-result-list/headless-folded-result-list';

export type {
  RedirectionTrigger,
  RedirectionTriggerState,
} from './controllers/core/triggers/headless-core-redirection-trigger';
export {buildRedirectionTrigger} from './controllers/triggers/headless-redirection-trigger';

export type {
  QueryTrigger,
  QueryTriggerState,
} from './controllers/core/triggers/headless-core-query-trigger';
export {buildQueryTrigger} from './controllers/triggers/headless-query-trigger';

export type {
  ExecuteTrigger,
  ExecuteTriggerState,
} from './controllers/triggers/headless-execute-trigger';
export {buildExecuteTrigger} from './controllers/triggers/headless-execute-trigger';

export type {ExecuteTriggerParams} from './api/common/trigger';

export type {
  NotifyTrigger,
  NotifyTriggerState,
} from './controllers/core/triggers/headless-core-notify-trigger';
export {buildNotifyTrigger} from './controllers/triggers/headless-notify-trigger';

export type {
  SmartSnippet,
  SmartSnippetOptions,
  SmartSnippetProps,
  SmartSnippetState,
  QuestionAnswerDocumentIdentifier,
  SmartSnippetCore,
} from './controllers/smart-snippet/headless-smart-snippet';
export {buildSmartSnippet} from './controllers/smart-snippet/headless-smart-snippet';

export type {InlineLink} from './controllers/smart-snippet/headless-smart-snippet-interactive-inline-links';

export type {
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListOptions,
  SmartSnippetQuestionsListProps,
  SmartSnippetQuestionsListState,
  SmartSnippetRelatedQuestion,
  CoreSmartSnippetQuestionsList,
  CoreSmartSnippetQuestionsListState,
} from './controllers/smart-snippet-questions-list/headless-smart-snippet-questions-list';
export {buildSmartSnippetQuestionsList} from './controllers/smart-snippet-questions-list/headless-smart-snippet-questions-list';

export type {
  RecentQueriesListInitialState,
  RecentQueriesList,
  RecentQueriesState,
  RecentQueriesListProps,
  RecentQueriesListOptions,
} from './controllers/recent-queries-list/headless-recent-queries-list';
export {buildRecentQueriesList} from './controllers/recent-queries-list/headless-recent-queries-list';

export type {
  RecentResultsListInitialState,
  RecentResultsList,
  RecentResultsState,
  RecentResultsListProps,
  RecentResultsListOptions,
} from './controllers/recent-results-list/headless-recent-results-list';
export {buildRecentResultsList} from './controllers/recent-results-list/headless-recent-results-list';

export type {
  InteractiveRecentResult,
  InteractiveRecentResultProps,
  InteractiveRecentResultOptions,
} from './controllers/recent-results-list/headless-interactive-recent-result';
export {buildInteractiveRecentResult} from './controllers/recent-results-list/headless-interactive-recent-result';

export type {
  InteractiveResultCore,
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
} from './controllers/core/interactive-result/headless-core-interactive-result';

export type {
  FacetConditionsManager,
  AnyFacetValuesCondition,
} from './controllers/core/facets/facet-conditions-manager/headless-facet-conditions-manager';
export {buildCoreFacetConditionsManager as buildFacetConditionsManager} from './controllers/core/facets/facet-conditions-manager/headless-facet-conditions-manager';

export type {
  FieldSuggestionsValue,
  FieldSuggestionsState,
  FieldSuggestions,
  FieldSuggestionsOptions,
  FieldSuggestionsProps,
} from './controllers/field-suggestions/facet/headless-field-suggestions';
export {buildFieldSuggestions} from './controllers/field-suggestions/facet/headless-field-suggestions';

export type {
  CategoryFieldSuggestionsValue,
  CategoryFieldSuggestionsState,
  CategoryFieldSuggestions,
  CategoryFieldSuggestionsOptions,
  CategoryFieldSuggestionsProps,
} from './controllers/field-suggestions/category-facet/headless-category-field-suggestions';

export {buildCategoryFieldSuggestions} from './controllers/field-suggestions/category-facet/headless-category-field-suggestions';

export type {
  AutomaticFacet,
  AutomaticFacetState,
  AutomaticFacetGenerator,
  AutomaticFacetGeneratorProps,
  AutomaticFacetGeneratorState,
  AutomaticFacetGeneratorOptions,
} from './controllers/facets/automatic-facet-generator/headless-automatic-facet-generator';
export {buildAutomaticFacetGenerator} from './controllers/facets/automatic-facet-generator/headless-automatic-facet-generator';

export type {
  GeneratedAnswer,
  GeneratedAnswerState,
  GeneratedAnswerProps,
  GeneratedAnswerCitation,
  GeneratedResponseFormat,
  GeneratedAnswerPropsInitialState,
} from './controllers/generated-answer/headless-generated-answer';
export {buildGeneratedAnswer} from './controllers/generated-answer/headless-generated-answer';

export type {
  InteractiveCitationOptions,
  InteractiveCitationProps,
  InteractiveCitation,
} from './controllers/generated-answer/headless-interactive-citation';
export {buildInteractiveCitation} from './controllers/generated-answer/headless-interactive-citation';
//#endregion

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
export * from './features/actions-history/ipx-actions-history-actions-loader';

// Types & Helpers
export {API_DATE_FORMAT} from './api/search/date/date-format';
export {HighlightUtils};
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
export type {
  ResultTemplatesManager,
  ResultTemplate,
  ResultTemplateCondition,
} from './features/result-templates/result-templates-manager';
export type {
  TemplatesManager,
  Template,
} from './features/templates/templates-manager';
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
export type {
  GeneratedAnswerStyle,
  GeneratedContentFormat,
} from './features/generated-answer/generated-response-format';

export * from './utils/query-expression/query-expression';

export type {
  GeneratedAnswerFeedback,
  GeneratedAnswerFeedbackOption,
} from './features/generated-answer/generated-answer-analytics-actions';
