export type {Controller} from './controller/headless-controller';
export {buildController} from './controller/headless-controller';

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
} from './relevance-inspector/headless-relevance-inspector';
export {buildRelevanceInspector} from './relevance-inspector/headless-relevance-inspector';

export type {
  Context,
  ContextState,
  ContextValue,
  ContextPayload,
} from './context/headless-context';
export {buildContext} from './context/headless-context';

export type {
  DictionaryFieldContext,
  DictionaryFieldContextState,
  DictionaryFieldContextPayload,
} from './dictionary-field-context/headless-dictionary-field-context';
export {buildDictionaryFieldContext} from './dictionary-field-context/headless-dictionary-field-context';

export type {
  DidYouMean,
  DidYouMeanState,
  QueryCorrection,
  WordCorrection,
} from './did-you-mean/headless-did-you-mean';
export {buildDidYouMean} from './did-you-mean/headless-did-you-mean';

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
} from './facets/category-facet/headless-category-facet';
export {buildCategoryFacet} from './facets/category-facet/headless-category-facet';

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
} from './facets/facet/headless-facet';
export {buildFacet} from './facets/facet/headless-facet';

export type {
  DateRangeOptions,
  DateRangeRequest,
  DateRangeInput,
  DateFacetOptions,
  DateFacetProps,
  DateFacetState,
  DateFacet,
} from './facets/range-facet/date-facet/headless-date-facet';
export {
  buildDateRange,
  buildDateFacet,
} from './facets/range-facet/date-facet/headless-date-facet';

export type {
  NumericRangeOptions,
  NumericRangeRequest,
  NumericFacetOptions,
  NumericFacetProps,
  NumericFacetState,
  NumericFacet,
} from './facets/range-facet/numeric-facet/headless-numeric-facet';
export {
  buildNumericRange,
  buildNumericFacet,
} from './facets/range-facet/numeric-facet/headless-numeric-facet';

export type {
  NumericFilter,
  NumericFilterOptions,
  NumericFilterProps,
  NumericFilterRange,
  NumericFilterState,
  NumericFilterInitialState,
} from './facets/range-facet/numeric-facet/headless-numeric-filter';
export {buildNumericFilter} from './facets/range-facet/numeric-facet/headless-numeric-filter';

export type {
  DateFilter,
  DateFilterOptions,
  DateFilterProps,
  DateFilterRange,
  DateFilterState,
  DateFilterInitialState,
} from './facets/range-facet/date-facet/headless-date-filter';
export {buildDateFilter} from './facets/range-facet/date-facet/headless-date-filter';

export type {
  HistoryManager,
  HistoryManagerState,
} from './history-manager/headless-history-manager';
export {buildHistoryManager} from './history-manager/headless-history-manager';

export type {
  PagerInitialState,
  PagerOptions,
  PagerProps,
  PagerState,
  Pager,
} from './pager/headless-pager';
export {buildPager} from './pager/headless-pager';

export type {
  QueryError,
  QueryErrorState,
} from './query-error/headless-query-error';
export {buildQueryError} from './query-error/headless-query-error';

export type {
  QuerySummaryState,
  QuerySummary,
} from './query-summary/headless-query-summary';
export {buildQuerySummary} from './query-summary/headless-query-summary';

export type {
  ResultListProps,
  ResultListOptions,
  ResultListState,
  ResultList,
} from './result-list/headless-result-list';
export {buildResultList} from './result-list/headless-result-list';

export type {
  InteractiveResultOptions,
  InteractiveResultProps,
  InteractiveResult,
} from './result-list/headless-interactive-result';
export {buildInteractiveResult} from './result-list/headless-interactive-result';

export type {
  ResultsPerPageInitialState,
  ResultsPerPageProps,
  ResultsPerPageState,
  ResultsPerPage,
} from './results-per-page/headless-results-per-page';
export {buildResultsPerPage} from './results-per-page/headless-results-per-page';

export type {
  SearchBoxOptions,
  SearchBoxProps,
  SearchBoxState,
  SearchBox,
  Suggestion,
  SuggestionHighlightingOptions,
  Delimiters,
} from './search-box/headless-search-box';
export {buildSearchBox} from './search-box/headless-search-box';

export type {
  SortInitialState,
  SortProps,
  SortState,
  Sort,
} from './sort/headless-sort';
export {buildSort} from './sort/headless-sort';

export type {
  StaticFilterValueOptions,
  StaticFilter,
  StaticFilterOptions,
  StaticFilterProps,
  StaticFilterState,
  StaticFilterValue,
  StaticFilterValueState,
} from './static-filter/headless-static-filter';
export {
  buildStaticFilterValue,
  buildStaticFilter,
} from './static-filter/headless-static-filter';

export type {
  TabInitialState,
  TabOptions,
  TabProps,
  TabState,
  Tab,
} from './tab/headless-tab';
export {buildTab} from './tab/headless-tab';

export type {
  FacetManagerPayload,
  FacetManagerState,
  FacetManager,
} from './facet-manager/headless-facet-manager';
export {buildFacetManager} from './facet-manager/headless-facet-manager';

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
} from './breadcrumb-manager/headless-breadcrumb-manager';
export {buildBreadcrumbManager} from './breadcrumb-manager/headless-breadcrumb-manager';

export type {
  StandaloneSearchBoxOptions,
  StandaloneSearchBoxAnalytics,
  StandaloneSearchBoxProps,
  StandaloneSearchBoxState,
  StandaloneSearchBox,
} from './standalone-search-box/headless-standalone-search-box';
export {buildStandaloneSearchBox} from './standalone-search-box/headless-standalone-search-box';

export type {
  SearchParameterManagerProps,
  SearchParameterManagerInitialState,
  SearchParameterManagerState,
  SearchParameterManager,
  SearchParameters,
} from './search-parameter-manager/headless-search-parameter-manager';
export {buildSearchParameterManager} from './search-parameter-manager/headless-search-parameter-manager';

export type {
  UrlManagerProps,
  UrlManagerInitialState,
  UrlManagerState,
  UrlManager,
} from './url-manager/headless-url-manager';
export {buildUrlManager} from './url-manager/headless-url-manager';

export type {
  SearchStatus,
  SearchStatusState,
} from './search-status/headless-search-status';
export {buildSearchStatus} from './search-status/headless-search-status';

export type {ErrorPayload} from './controller/error-payload';

export type {
  QuickviewCore,
  QuickviewCoreOptions,
  QuickviewCoreProps,
  QuickviewCoreState,
} from './core/quickview/headless-core-quickview';
export {buildQuickviewCore} from './core/quickview/headless-core-quickview';

export type {
  Quickview,
  QuickviewOptions,
  QuickviewProps,
  QuickviewState,
} from './quickview/headless-quickview';
export {buildQuickview} from './quickview/headless-quickview';

export type {
  FoldedCollection,
  FoldedResult,
  FoldedResultList,
  FoldingOptions,
  FoldedResultListOptions,
  FoldedResultListProps,
  FoldedResultListState,
} from './folded-result-list/headless-folded-result-list';
export {buildFoldedResultList} from './folded-result-list/headless-folded-result-list';

export type {
  RedirectionTrigger,
  RedirectionTriggerState,
} from './triggers/headless-redirection-trigger';
export {buildRedirectionTrigger} from './triggers/headless-redirection-trigger';

export type {
  QueryTrigger,
  QueryTriggerState,
} from './triggers/headless-query-trigger';
export {buildQueryTrigger} from './triggers/headless-query-trigger';

export type {
  ExecuteTrigger,
  ExecuteTriggerState,
} from './triggers/headless-execute-trigger';
export {buildExecuteTrigger} from './triggers/headless-execute-trigger';

export type {ExecuteTriggerParams} from './../api/search/trigger';

export type {
  NotifyTrigger,
  NotifyTriggerState,
} from './triggers/headless-notify-trigger';
export {buildNotifyTrigger} from './triggers/headless-notify-trigger';

export type {
  SmartSnippet,
  SmartSnippetState,
  QuestionAnswerDocumentIdentifier,
} from './smart-snippet/headless-smart-snippet';
export {buildSmartSnippet} from './smart-snippet/headless-smart-snippet';

export type {
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListState,
  SmartSnippetRelatedQuestion,
} from './smart-snippet-questions-list/headless-smart-snippet-questions-list';
export {buildSmartSnippetQuestionsList} from './smart-snippet-questions-list/headless-smart-snippet-questions-list';

export type {
  RecentQueriesList,
  RecentQueriesState,
} from './recent-queries-list/headless-recent-queries-list';
export {buildRecentQueriesList} from './recent-queries-list/headless-recent-queries-list';

export type {
  RecentResultsList,
  RecentResultsState,
} from './recent-results-list/headless-recent-results-list';
export {buildRecentResultsList} from './recent-results-list/headless-recent-results-list';

export type {InteractiveRecentResult} from './recent-results-list/headless-interactive-recent-result';
export {buildInteractiveRecentResult} from './recent-results-list/headless-interactive-recent-result';

export type {
  InteractiveResultCore,
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
} from './core/interactive-result/headless-core-interactive-result';
export {
  /**
   * @deprecated This is an internal controller that will be removed in the next version. Please use `buildInteractiveResult` instead.
   */
  buildInteractiveResultCore,
} from './core/interactive-result/headless-core-interactive-result';

export type {
  FacetDependenciesManager,
  AnyFacetDependency,
} from './core/facets/facet-dependencies-manager/headless-facet-dependencies-manager';
export {buildFacetDependenciesManager} from './core/facets/facet-dependencies-manager/headless-facet-dependencies-manager';
