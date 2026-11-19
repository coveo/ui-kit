/**
 * The Coveo Headless SSR sub-package exposes the engine definer, controller definers, actions, and utility functions to build a server-side rendered search experience.
 *
 * @example
 * ```typescript
 * import {
 *   defineResultList,
 *   defineSearchBox,
 *   defineSearchEngine,
 *   getSampleSearchEngineConfiguration,
 *   type InferHydratedState,
 *   type InferStaticState,
 * } from '@coveo/headless-ssr';
 *
 * // Shared by the server and the browser. The navigator context is per-request data: it is passed
 * // to `fetchStaticState()`, not to the configuration.
 * export const {searchEngineDefinition, standaloneEngineDefinition} = defineSearchEngine({
 *   configuration: getSampleSearchEngineConfiguration(),
 *   controllers: {
 *     searchBox: defineSearchBox(),
 *     resultList: defineResultList(),
 *   },
 * });
 *
 * export type StaticState = InferStaticState<typeof searchEngineDefinition>;
 * export type HydratedState = InferHydratedState<typeof searchEngineDefinition>;
 *
 * // On the server, once per request
 * const staticState = await searchEngineDefinition.fetchStaticState({
 *   navigatorContext: {
 *     clientId: '...',
 *     location: 'https://example.com/search?q=running+shoes',
 *     referrer: null,
 *     userAgent: '...',
 *     forwardedFor: '...',
 *   },
 *   searchParams: {q: 'running shoes'},
 * });
 *
 * // In the browser, from the serialized static state, passed as is: it already carries the
 * // navigator context, the search parameters and the access token.
 * const {engine, controllers} = await searchEngineDefinition.hydrateStaticState(staticState);
 * ```
 * @module SSR Search
 */

export type {Relay} from '@coveo/relay';
// 3rd Party Libraries
export type {Middleware, Unsubscribe} from '@reduxjs/toolkit';
export type {AnalyticsClientSendEventHook} from 'coveo.analytics';
export type {ExecuteTriggerParams} from '@coveo/headless';
export type {CoreEngine, ExternalEngineOptions} from '@coveo/headless';
export type {
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
  EngineConfiguration,
} from '@coveo/headless';
export type {LoggerOptions, LogLevel} from '@coveo/headless';
export type {NavigatorContext} from '@coveo/headless';
export type {NavigatorContextProvider} from '@coveo/headless/ssr-internal';
export type {ControllerStaticState} from './common/types/controllers.js';
// Main App
export type {SearchConfigurationOptions, SearchEngineConfiguration} from '@coveo/headless';
export type {SSRSearchEngineOptions as SearchEngineOptions} from './search/types/build.js';
export {getSampleSearchEngineConfiguration} from '@coveo/headless';
export type {ErrorPayload} from '@coveo/headless';
//#region Controllers
export type {Controller, Subscribable} from '@coveo/headless';
export type {InlineLink} from '@coveo/headless';
export type {
  AutomaticFacetBreadcrumb,
  Breadcrumb,
  BreadcrumbManager,
  BreadcrumbManagerDefinition,
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
} from './search/controllers/breadcrumb-manager/headless-breadcrumb-manager.ssr.js';
export {defineBreadcrumbManager} from './search/controllers/breadcrumb-manager/headless-breadcrumb-manager.ssr.js';
export type {
  Context,
  ContextDefinition,
  ContextInitialState,
  ContextPayload,
  ContextProps,
  ContextState,
  ContextValue,
} from './search/controllers/context/headless-context.ssr.js';
export {defineContext} from './search/controllers/context/headless-context.ssr.js';
export type {
  DictionaryFieldContext,
  DictionaryFieldContextDefinition,
  DictionaryFieldContextPayload,
  DictionaryFieldContextState,
} from './search/controllers/dictionary-field-context/headless-dictionary-field-context.ssr.js';
export {defineDictionaryFieldContext} from './search/controllers/dictionary-field-context/headless-dictionary-field-context.ssr.js';
export type {
  DidYouMean,
  DidYouMeanDefinition,
  DidYouMeanState,
  QueryCorrection,
  WordCorrection,
} from './search/controllers/did-you-mean/headless-did-you-mean.ssr.js';
export {defineDidYouMean} from './search/controllers/did-you-mean/headless-did-you-mean.ssr.js';
export type {
  FacetManager,
  FacetManagerDefinition,
  FacetManagerPayload,
  FacetManagerState,
} from './search/controllers/facet-manager/headless-facet-manager.ssr.js';
export {defineFacetManager} from './search/controllers/facet-manager/headless-facet-manager.ssr.js';
export type {
  AutomaticFacet,
  AutomaticFacetGenerator,
  AutomaticFacetGeneratorDefinition,
  AutomaticFacetGeneratorOptions,
  AutomaticFacetGeneratorProps,
  AutomaticFacetGeneratorState,
  AutomaticFacetState,
} from './search/controllers/facets/automatic-facet-generator/headless-automatic-facet-generator.ssr.js';
export {defineAutomaticFacetGenerator} from './search/controllers/facets/automatic-facet-generator/headless-automatic-facet-generator.ssr.js';
export type {
  CategoryFacet,
  CategoryFacetDefinition,
  CategoryFacetOptions,
  CategoryFacetProps,
  CategoryFacetSearch,
  CategoryFacetSearchOptions,
  CategoryFacetSearchResult,
  CategoryFacetSearchState,
  CategoryFacetState,
  CoreCategoryFacet,
  CoreCategoryFacetState,
} from './search/controllers/facets/category-facet/headless-category-facet.ssr.js';
export {defineCategoryFacet} from './search/controllers/facets/category-facet/headless-category-facet.ssr.js';
export type {
  CoreFacet,
  CoreFacetState,
  Facet,
  FacetDefinition,
  FacetOptions,
  FacetProps,
  FacetSearch,
  FacetSearchOptions,
  FacetSearchState,
  FacetState,
  FacetValue,
  FacetValueState,
  SpecificFacetSearchResult,
} from './search/controllers/facets/facet/headless-facet.ssr.js';
export {defineFacet} from './search/controllers/facets/facet/headless-facet.ssr.js';
export type {
  DateFacet,
  DateFacetDefinition,
  DateFacetOptions,
  DateFacetProps,
  DateFacetState,
  DateRangeInput,
  DateRangeOptions,
} from './search/controllers/facets/range-facet/date-facet/headless-date-facet.ssr.js';
export {
  buildDateRange,
  defineDateFacet,
} from './search/controllers/facets/range-facet/date-facet/headless-date-facet.ssr.js';
export type {
  DateFilter,
  DateFilterDefinition,
  DateFilterInitialState,
  DateFilterOptions,
  DateFilterProps,
  DateFilterRange,
  DateFilterState,
} from './search/controllers/facets/range-facet/date-facet/headless-date-filter.ssr.js';
export {defineDateFilter} from './search/controllers/facets/range-facet/date-facet/headless-date-filter.ssr.js';
export type {
  NumericFacet,
  NumericFacetDefinition,
  NumericFacetOptions,
  NumericFacetProps,
  NumericFacetState,
  NumericRangeOptions,
} from './search/controllers/facets/range-facet/numeric-facet/headless-numeric-facet.ssr.js';
export {
  buildNumericRange,
  defineNumericFacet,
} from './search/controllers/facets/range-facet/numeric-facet/headless-numeric-facet.ssr.js';
export type {
  NumericFilter,
  NumericFilterDefinition,
  NumericFilterInitialState,
  NumericFilterOptions,
  NumericFilterProps,
  NumericFilterRange,
  NumericFilterState,
} from './search/controllers/facets/range-facet/numeric-facet/headless-numeric-filter.ssr.js';
export {defineNumericFilter} from './search/controllers/facets/range-facet/numeric-facet/headless-numeric-filter.ssr.js';
export type {
  CategoryFieldSuggestions,
  CategoryFieldSuggestionsDefinition,
  CategoryFieldSuggestionsOptions,
  CategoryFieldSuggestionsProps,
  CategoryFieldSuggestionsState,
  CategoryFieldSuggestionsValue,
} from './search/controllers/field-suggestions/category-facet/headless-category-field-suggestions.ssr.js';
export {defineCategoryFieldSuggestions} from './search/controllers/field-suggestions/category-facet/headless-category-field-suggestions.ssr.js';
export type {
  FieldSuggestions,
  FieldSuggestionsDefinition,
  FieldSuggestionsOptions,
  FieldSuggestionsProps,
  FieldSuggestionsState,
  FieldSuggestionsValue,
} from './search/controllers/field-suggestions/facet/headless-field-suggestions.ssr.js';
export {defineFieldSuggestions} from './search/controllers/field-suggestions/facet/headless-field-suggestions.ssr.js';
export type {
  FoldedCollection,
  FoldedResult,
  FoldedResultList,
  FoldedResultListDefinition,
  FoldedResultListOptions,
  FoldedResultListProps,
  FoldedResultListState,
  FoldingOptions,
} from './search/controllers/folded-result-list/headless-folded-result-list.ssr.js';
export {defineFoldedResultList} from './search/controllers/folded-result-list/headless-folded-result-list.ssr.js';
export type {
  HistoryManager,
  HistoryManagerDefinition,
  HistoryManagerState,
} from './search/controllers/history-manager/headless-history-manager.ssr.js';
export {defineHistoryManager} from './search/controllers/history-manager/headless-history-manager.ssr.js';
export type {
  InstantResultOptions,
  InstantResultProps,
  InstantResults,
  InstantResultsDefinition,
  InstantResultsState,
} from './search/controllers/instant-results/instant-results.ssr.js';
export {defineInstantResults} from './search/controllers/instant-results/instant-results.ssr.js';
export type {
  Pager,
  PagerDefinition,
  PagerInitialState,
  PagerOptions,
  PagerProps,
  PagerState,
} from './search/controllers/pager/headless-pager.ssr.js';
export {definePager} from './search/controllers/pager/headless-pager.ssr.js';
export type {
  QueryError,
  QueryErrorDefinition,
  QueryErrorState,
} from './search/controllers/query-error/headless-query-error.ssr.js';
export {defineQueryError} from './search/controllers/query-error/headless-query-error.ssr.js';
export type {
  QuerySummary,
  QuerySummaryDefinition,
  QuerySummaryState,
} from './search/controllers/query-summary/headless-query-summary.ssr.js';
export {defineQuerySummary} from './search/controllers/query-summary/headless-query-summary.ssr.js';
export type {
  CoreQuickview,
  CoreQuickviewState,
  Quickview,
  QuickviewDefinition,
  QuickviewOptions,
  QuickviewProps,
  QuickviewState,
} from './search/controllers/quickview/headless-quickview.ssr.js';
export {defineQuickview} from './search/controllers/quickview/headless-quickview.ssr.js';
export type {
  RecentQueriesList,
  RecentQueriesListDefinition,
  RecentQueriesListInitialState,
  RecentQueriesListOptions,
  RecentQueriesListProps,
  RecentQueriesState,
} from './search/controllers/recent-queries-list/headless-recent-queries-list.ssr.js';
export {defineRecentQueriesList} from './search/controllers/recent-queries-list/headless-recent-queries-list.ssr.js';
export type {
  RecentResultsList,
  RecentResultsListDefinition,
  RecentResultsListInitialState,
  RecentResultsListOptions,
  RecentResultsListProps,
  RecentResultsState,
} from './search/controllers/recent-results-list/headless-recent-results-list.ssr.js';
export {defineRecentResultsList} from './search/controllers/recent-results-list/headless-recent-results-list.ssr.js';
export type {
  DocumentWeights,
  ExecutionReport,
  ExecutionStep,
  QueryExpressions,
  QueryRankingExpression,
  QueryRankingExpressionWeights,
  RankingInformation,
  RelevanceInspector,
  RelevanceInspectorDefinition,
  RelevanceInspectorInitialState,
  RelevanceInspectorProps,
  RelevanceInspectorState,
  ResultRankingInformation,
  SecurityIdentity,
  TermWeightReport,
} from './search/controllers/relevance-inspector/headless-relevance-inspector.ssr.js';
export {defineRelevanceInspector} from './search/controllers/relevance-inspector/headless-relevance-inspector.ssr.js';
export type {
  ResultList,
  ResultListDefinition,
  ResultListOptions,
  ResultListProps,
  ResultListState,
} from './search/controllers/result-list/headless-result-list.ssr.js';
export {defineResultList} from './search/controllers/result-list/headless-result-list.ssr.js';
export type {
  ResultsPerPage,
  ResultsPerPageDefinition,
  ResultsPerPageInitialState,
  ResultsPerPageProps,
  ResultsPerPageState,
} from './search/controllers/results-per-page/headless-results-per-page.ssr.js';
export {defineResultsPerPage} from './search/controllers/results-per-page/headless-results-per-page.ssr.js';
export type {
  Delimiters,
  SearchBox,
  SearchBoxDefinition,
  SearchBoxOptions,
  SearchBoxProps,
  SearchBoxState,
  Suggestion,
  SuggestionHighlightingOptions,
} from './search/controllers/search-box/headless-search-box.ssr.js';
export {defineSearchBox} from './search/controllers/search-box/headless-search-box.ssr.js';
export type {
  SearchParameterManager,
  SearchParameterManagerBuildProps,
  SearchParameterManagerDefinition,
  SearchParameterManagerInitialState,
  SearchParameterManagerState,
  SearchParameters,
} from './search/controllers/search-parameter-manager/headless-search-parameter-manager.ssr.js';
export {defineSearchParameterManager} from './search/controllers/search-parameter-manager/headless-search-parameter-manager.ssr.js';
export type {
  SearchStatus,
  SearchStatusDefinition,
  SearchStatusState,
} from './search/controllers/search-status/headless-search-status.ssr.js';
export {defineSearchStatus} from './search/controllers/search-status/headless-search-status.ssr.js';
export type {
  QuestionAnswerDocumentIdentifier,
  SmartSnippet,
  SmartSnippetCore,
  SmartSnippetDefinition,
  SmartSnippetOptions,
  SmartSnippetProps,
  SmartSnippetState,
} from './search/controllers/smart-snippet/headless-smart-snippet.ssr.js';
export {defineSmartSnippet} from './search/controllers/smart-snippet/headless-smart-snippet.ssr.js';
export type {
  CoreSmartSnippetQuestionsList,
  CoreSmartSnippetQuestionsListState,
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListDefinition,
  SmartSnippetQuestionsListOptions,
  SmartSnippetQuestionsListProps,
  SmartSnippetQuestionsListState,
  SmartSnippetRelatedQuestion,
} from './search/controllers/smart-snippet-questions-list/headless-smart-snippet-questions-list.ssr.js';
export {defineSmartSnippetQuestionsList} from './search/controllers/smart-snippet-questions-list/headless-smart-snippet-questions-list.ssr.js';
export type {
  Sort,
  SortDefinition,
  SortInitialState,
  SortProps,
  SortState,
} from './search/controllers/sort/headless-sort.ssr.js';
export {defineSort} from './search/controllers/sort/headless-sort.ssr.js';
export type {
  StandaloneSearchBox,
  StandaloneSearchBoxAnalytics,
  StandaloneSearchBoxDefinition,
  StandaloneSearchBoxOptions,
  StandaloneSearchBoxProps,
  StandaloneSearchBoxState,
} from './search/controllers/standalone-search-box/headless-standalone-search-box.ssr.js';
export {defineStandaloneSearchBox} from './search/controllers/standalone-search-box/headless-standalone-search-box.ssr.js';
export type {
  StaticFilter,
  StaticFilterDefinition,
  StaticFilterOptions,
  StaticFilterProps,
  StaticFilterState,
  StaticFilterValue,
  StaticFilterValueOptions,
  StaticFilterValueState,
} from './search/controllers/static-filter/headless-static-filter.ssr.js';
export {
  buildStaticFilterValue,
  defineStaticFilter,
} from './search/controllers/static-filter/headless-static-filter.ssr.js';
export type {
  Tab,
  TabDefinition,
  TabInitialState,
  TabOptions,
  TabProps,
  TabState,
} from './search/controllers/tab/headless-tab.ssr.js';
export {defineTab} from './search/controllers/tab/headless-tab.ssr.js';
export type {
  TabManager,
  TabManagerDefinition,
  TabManagerState,
} from './search/controllers/tab-manager/headless-tab-manager.ssr.js';
export {defineTabManager} from './search/controllers/tab-manager/headless-tab-manager.ssr.js';
export type {
  ExecuteTrigger,
  ExecuteTriggerDefinition,
  ExecuteTriggerState,
} from './search/controllers/triggers/headless-execute-trigger.ssr.js';
export {defineExecuteTrigger} from './search/controllers/triggers/headless-execute-trigger.ssr.js';
export type {
  NotifyTrigger,
  NotifyTriggerDefinition,
  NotifyTriggerState,
} from './search/controllers/triggers/headless-notify-trigger.ssr.js';
export {defineNotifyTrigger} from './search/controllers/triggers/headless-notify-trigger.ssr.js';
export type {
  QueryTrigger,
  QueryTriggerDefinition,
  QueryTriggerState,
} from './search/controllers/triggers/headless-query-trigger.ssr.js';
export {defineQueryTrigger} from './search/controllers/triggers/headless-query-trigger.ssr.js';
export type {
  RedirectionTrigger,
  RedirectionTriggerDefinition,
  RedirectionTriggerState,
} from './search/controllers/triggers/headless-redirection-trigger.ssr.js';
export {defineRedirectionTrigger} from './search/controllers/triggers/headless-redirection-trigger.ssr.js';
export type {
  UrlManager,
  UrlManagerBuildProps,
  UrlManagerInitialState,
  UrlManagerProps,
  UrlManagerState,
} from './search/controllers/url-manager/headless-url-manager.ssr.js';
export {defineUrlManager} from './search/controllers/url-manager/headless-url-manager.ssr.js';
export {MissingControllerProps} from './common/errors.js';
export type {BuildNavigatorContextOptions, RequestHeaders} from './common/navigator-context.js';
export {buildNavigatorContext} from './common/navigator-context.js';
export {defineSearchEngine} from './search/engine/search-engine.ssr.js';
export type {
  BuildConfig,
  SearchCompletedAction,
  SSRSearchEngine as SearchEngine,
} from './search/types/build.js';
export type {
  AugmentedControllerDefinition,
  ControllerDefinitionsMap,
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromControllers,
  InferHydratedState,
  InferStaticState,
} from './search/types/controller-definition.js';
export type {
  InferControllerFromDefinition,
  InferControllerStaticStateMapFromDefinitions,
  InferControllersMapFromDefinition,
} from './search/types/controller-inference.js';
export type {SearchEngineDefinition, SearchEngineDefinitionOptions} from './search/types/engine.js';
export type {SearchStaticState} from './search/types/fetch-static-state.js';
export type {SearchHydratedState} from './search/types/hydrate-static-state.js';
export type {EngineDefinition, EngineStaticState} from './common/types/engine.js';
// State
export type {SearchAppState, SearchParametersState} from '@coveo/headless';

//#endregion

export {getAnalyticsNextApiBaseUrl, getOrganizationEndpoint} from '@coveo/headless';
export type {RelativeDate, RelativeDatePeriod, RelativeDateUnit} from '@coveo/headless';
export {deserializeRelativeDate, validateRelativeDate} from '@coveo/headless';
export type {FieldDescription} from '@coveo/headless';
export type {Raw} from '@coveo/headless';
export type {Result} from '@coveo/headless';
export type {PhrasesToHighlight, TermsToHighlight} from '@coveo/headless';
export {
  loadAdvancedSearchQueryActions,
  type AdvancedSearchQueryActionCreatorPayload,
  type AdvancedSearchQueryActionCreators,
} from '@coveo/headless';
export {loadClickAnalyticsActions, type ClickAnalyticsActionCreators} from '@coveo/headless';
export {
  loadGenericAnalyticsActions,
  type LogClickEventActionCreatorPayload,
  type LogCustomEventActionCreatorPayload,
  type LogSearchEventActionCreatorPayload,
  type GenericAnalyticsActionCreators,
} from '@coveo/headless';
//#endregion
// Analytics Actions
export {
  loadSearchAnalyticsActions,
  type LogCategoryFacetBreadcrumbActionCreatorPayload,
  type LogDateFacetBreadcrumbActionCreatorPayload,
  type LogFacetBreadcrumbActionCreatorPayload,
  type LogFacetDeselectActionCreatorPayload,
  type LogFacetExcludeActionCreatorPayload,
  type LogFacetSelectActionCreatorPayload,
  type LogFacetUnexcludeActionCreatorPayload,
  type LogFacetUpdateSortActionCreatorPayload,
  type LogNumericFacetBreadcrumbActionCreatorPayload,
  type LogQuerySuggestionClickActionCreatorPayload,
  type LogStaticFilterClearAllActionCreatorPayload,
  type LogStaticFilterToggleValueActionCreatorPayload,
  type LogUndoTriggerQueryActionCreatorPayload,
  type QuestionAnsweringInlineLinkActionCreatorPayload,
  type QuestionAnsweringUniqueIdentifierActionCreatorPayload,
  type SmartSnippetFeedback,
  type StaticFilterValueMetadata,
  type SearchAnalyticsActionCreators,
} from '@coveo/headless';
export {loadBreadcrumbActions, type BreadcrumbActionCreators} from '@coveo/headless';
export {
  loadConfigurationActions,
  type SetOriginLevel2ActionCreatorPayload,
  type SetOriginLevel3ActionCreatorPayload,
  type UpdateAnalyticsConfigurationActionCreatorPayload,
  type UpdateBasicConfigurationActionCreatorPayload,
  type ConfigurationActionCreators,
} from '@coveo/headless';
export {
  loadSearchConfigurationActions,
  type UpdateSearchConfigurationActionCreatorPayload,
  type SearchConfigurationActionCreators,
} from '@coveo/headless';
export {
  loadContextActions,
  type AddContextActionCreatorPayload,
  type ContextActionCreators,
} from '@coveo/headless';
export {loadDebugActions, type DebugActionCreators} from '@coveo/headless';
export {
  loadDictionaryFieldContextActions,
  type AddDictionaryFieldContextActionCreatorPayload,
  type DictionaryFieldContextActionCreators,
} from '@coveo/headless';
export {loadDidYouMeanActions, type DidYouMeanActionCreators} from '@coveo/headless';
export {loadExcerptLengthActions, type ExcerptLengthActionCreators} from '@coveo/headless';
export {
  loadFacetOptionsActions,
  type DisableFacetActionCreatorPayload,
  type EnableFacetActionCreatorPayload,
  type UpdateFacetOptionsActionCreatorPayload,
  type FacetOptionsActionCreators,
} from '@coveo/headless';
export {
  loadCategoryFacetSetActions,
  type RegisterCategoryFacetActionCreatorPayload,
  type ToggleSelectCategoryFacetValueActionCreatorPayload,
  type UpdateCategoryFacetBasePathActionCreatorPayload,
  type UpdateCategoryFacetNumberOfValuesActionCreatorPayload,
  type UpdateCategoryFacetSortCriterionActionCreatorPayload,
  type UpdateFacetAutoSelectionActionCreatorPayload,
  type CategoryFacetSetActionCreators,
} from '@coveo/headless';
export type {CategoryFacetSortCriterion, CategoryFacetValueRequest} from '@coveo/headless';
export type {CategoryFacetValue, CategoryFacetValueCommon} from '@coveo/headless';
export type {FacetResultsMustMatch} from '@coveo/headless';
export {
  loadFacetSetActions,
  type RegisterFacetActionCreatorPayload,
  type ToggleSelectFacetValueActionCreatorPayload,
  type UpdateFacetIsFieldExpandedActionCreatorPayload,
  type UpdateFacetNumberOfValuesActionCreatorPayload,
  type UpdateFacetSortCriterionActionCreatorPayload,
  type UpdateFreezeCurrentValuesActionCreatorPayload,
  type FacetSetActionCreators,
} from '@coveo/headless';
// Selectors
export {
  baseFacetResponseSelector,
  facetRequestSelector,
  facetResponseSelectedValuesSelector,
  facetResponseSelector,
} from '@coveo/headless';
export type {FacetSortCriterion, FacetValueRequest} from '@coveo/headless';
export type {AnyFacetValueRequest} from '@coveo/headless';
export {
  loadDateFacetSetActions,
  type RegisterDateFacetActionCreatorPayload,
  type ToggleSelectDateFacetValueActionCreatorPayload,
  type UpdateDateFacetSortCriterionActionCreatorPayload,
  type UpdateDateFacetValuesActionCreatorPayload,
  type DateFacetSetActionCreators,
} from '@coveo/headless';
export type {DateRangeRequest} from '@coveo/headless';
export type {DateFacetValue} from '@coveo/headless';
export type {RangeFacetRangeAlgorithm, RangeFacetSortCriterion} from '@coveo/headless';
export type {NumericRangeRequest} from '@coveo/headless';
export type {NumericFacetValue} from '@coveo/headless';
export {
  loadNumericFacetSetActions,
  type RegisterNumericFacetActionCreatorPayload,
  type ToggleSelectNumericFacetValueActionCreatorPayload,
  type UpdateNumericFacetSortCriterionActionCreatorPayload,
  type UpdateNumericFacetValuesActionCreatorPayload,
  type NumericFacetSetActionCreators,
} from '@coveo/headless';
export {loadFieldActions, type FieldActionCreators} from '@coveo/headless';
export {
  DefaultFieldsToInclude,
  EcommerceDefaultFieldsToInclude,
  MinimumFieldsToInclude,
} from '@coveo/headless';
export {
  loadFoldingActions,
  type RegisterFoldingActionCreatorPayload,
  type FoldingActionCreators,
} from '@coveo/headless';
export {loadGeneratedAnswerActions, type GeneratedAnswerActionCreators} from '@coveo/headless';
export {loadHistoryActions, type HistoryActionCreators} from '@coveo/headless';
export {
  loadInstantResultsActions,
  type ClearExpiredInstantResultsActionCreatorPayload,
  type FetchInstantResultsActionCreatorPayload,
  type RegisterInstantResultActionCreatorPayload,
  type UpdateInstantResultQueryActionCreatorPayload,
  type InstantResultsActionCreators,
} from '@coveo/headless';
export {loadPaginationActions, type PaginationActionCreators} from '@coveo/headless';
export {currentPageSelector, currentPagesSelector, maxPageSelector} from '@coveo/headless';
export {loadPipelineActions, type PipelineActionCreators} from '@coveo/headless';
export {
  loadQueryActions,
  type UpdateQueryActionCreatorPayload,
  type QueryActionCreators,
} from '@coveo/headless';
export {
  loadQuerySetActions,
  type RegisterQuerySetQueryActionCreatorPayload,
  type UpdateQuerySetQueryActionCreatorPayload,
  type QuerySetActionCreators,
} from '@coveo/headless';
export {
  loadQuerySuggestActions,
  type ClearQuerySuggestActionCreatorPayload,
  type FetchQuerySuggestionsActionCreatorPayload,
  type RegisterQuerySuggestActionCreatorPayload,
  type SelectQuerySuggestionActionCreatorPayload,
  type QuerySuggestActionCreators,
} from '@coveo/headless';
export {loadQuestionAnsweringActions, type QuestionAnsweringActionCreators} from '@coveo/headless';
export {loadRecentQueriesActions, type RecentQueriesActionCreators} from '@coveo/headless';
export {
  loadRecentResultsActions,
  type RegisterRecentResultsCreatorPayload,
  type RecentResultsActionCreators,
} from '@coveo/headless';
export {loadResultPreviewActions, type ResultPreviewActionCreators} from '@coveo/headless';
//#region Grouped actions
export {ResultTemplatesHelpers} from '@coveo/headless';
export type {
  ResultTemplate,
  ResultTemplateCondition,
  ResultTemplatesManager,
} from '@coveo/headless';
export {buildResultTemplatesManager} from '@coveo/headless';
export {loadSearchActions, type SearchActionCreators} from '@coveo/headless';
export {loadSearchHubActions, type SearchHubActionCreators} from '@coveo/headless';
export {buildSearchParameterSerializer} from '@coveo/headless';
// Types & Helpers
export {buildSSRSearchParameterSerializer} from '@coveo/headless/ssr-internal';
export type {
  SortByDate,
  SortByField,
  SortByNoSort,
  SortByQRE,
  SortByRelevancy,
  SortCriterion,
} from '@coveo/headless';
export {
  buildCriterionExpression,
  buildDateSortCriterion,
  buildFieldSortCriterion,
  buildNoSortCriterion,
  buildQueryRankingExpressionSortCriterion,
  buildRelevanceSortCriterion,
  SortBy,
  SortOrder,
} from '@coveo/headless';
export {parseCriterionExpression} from '@coveo/headless';
export {loadSortCriteriaActions, type SortCriteriaActionCreators} from '@coveo/headless';
export {
  loadStandaloneSearchBoxSetActions,
  type FetchRedirectUrlActionCreatorPayload,
  type RegisterStandaloneSearchBoxActionCreatorPayload,
  type ResetStandaloneSearchBoxActionCreatorPayload,
  type UpdateAnalyticsToOmniboxFromLinkActionCreatorPayload,
  type UpdateAnalyticsToSearchFromLinkActionCreatorPayload,
  type StandaloneSearchBoxSetActionCreators,
} from '@coveo/headless';
export {
  loadStaticFilterSetActions,
  type RegisterStaticFilterActionCreatorPayload,
  type ToggleSelectStaticFilterValueActionCreatorPayload,
  type StaticFilterSetActionCreators,
} from '@coveo/headless';
export {
  loadTabSetActions,
  type RegisterTabActionCreatorPayload,
  type TabSetActionCreators,
} from '@coveo/headless';
export type {FunctionExecutionTrigger} from '@coveo/headless';
export type {HighlightKeyword} from '@coveo/headless';
export {
  buildQueryExpression,
  type DateFieldExpression,
  type DateRangeFieldExpression,
  type ExactMatchExpression,
  type FieldExistsExpression,
  type KeywordExpression,
  type NearExpression,
  type Negatable,
  type NumericFieldExpression,
  type NumericRangeFieldExpression,
  type OtherTerm,
  type QueryExtensionExpression,
  type StringFacetFieldExpression,
  type StringFieldExpression,
  type QueryExpression,
} from '@coveo/headless';
export type {PlatformEnvironment} from '@coveo/headless';
export {VERSION} from '@coveo/headless';
