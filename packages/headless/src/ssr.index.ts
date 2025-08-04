/**
 * The Coveo Headless SSR sub-package exposes exposes the engine, definers, controllers, actions, and utility functions to build a server side rendered search experience.
 *
 * @example
 * ```typescript
 *   import {
 *     Controller,
 *     ControllerDefinitionsMap,
 *     defineSearchEngine,
 *     InferStaticState,
 *     InferHydratedState,
 *     SearchEngine,
 *     SearchEngineDefinitionOptions,
 *     getSampleSearchEngineConfiguration,
 *     defineResultList,
 *     defineSearchBox,
 *   } from '@coveo/headless/ssr';
 *
 *  const config = {
 *     configuration: {
 *       ...getSampleSearchEngineConfiguration(),
 *       analytics: {
 *         trackingId: 'sports-ui-samples',
 *       },
 *     },
 *     controllers: {
 *       searchBox: defineSearchBox(),
 *       resultList: defineResultList(),
 *     },
 *   } satisfies SearchEngineDefinitionOptions<
 *     ControllerDefinitionsMap<SearchEngine, Controller>
 *   >;
 *
 * const engineDefinition = defineSearchEngine(config);
 *
 * export type SearchStaticState = InferStaticState<typeof engineDefinition>;
 * export type SearchHydratedState = InferHydratedState<typeof engineDefinition>;
 *
 * export const {
 *   fetchStaticState,
 *   hydrateStaticState,
 *   setNavigatorContextProvider,
 * } = engineDefinition;

 * ```
 * @module SSR Search
 */

export type {Relay} from '@coveo/relay';
// 3rd Party Libraries
export type {Middleware, Unsubscribe} from '@reduxjs/toolkit';
export type {AnalyticsClientSendEventHook} from 'coveo.analytics';
export type {ExecuteTriggerParams} from './api/common/trigger.js';
// export type
export type {CoreEngine, ExternalEngineOptions} from './app/engine.js';
export type {
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
  EngineConfiguration,
} from './app/engine-configuration.js';
export type {LoggerOptions, LogLevel} from './app/logger.js';
export type {
  NavigatorContext,
  NavigatorContextProvider,
} from './app/navigator-context-provider.js';
// Main App
export type {
  SearchConfigurationOptions,
  SearchEngineConfiguration,
  SearchEngineOptions,
} from './app/search-engine/search-engine.js';
export {getSampleSearchEngineConfiguration} from './app/search-engine/search-engine.js';
export type {ErrorPayload} from './controllers/controller/error-payload.js';
//#region Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller.js';
export type {InlineLink} from './controllers/smart-snippet/headless-smart-snippet-interactive-inline-links.js';
export type {Build} from './ssr/common/types/build.js';
export type {
  ControllerDefinitionsMap,
  ControllerDefinitionWithoutProps,
  ControllerDefinitionWithProps,
} from './ssr/common/types/controllers.js';
export type {
  EngineDefinition,
  InferBuildResult,
  InferHydratedState,
  InferStaticState,
} from './ssr/common/types/engine.js';
export type {
  InferControllerFromDefinition,
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromControllers,
  InferControllerStaticStateMapFromDefinitions,
  InferControllersMapFromDefinition,
} from './ssr/common/types/inference.js';
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
} from './ssr/search/controllers/breadcrumb-manager/headless-breadcrumb-manager.ssr.js';
export {defineBreadcrumbManager} from './ssr/search/controllers/breadcrumb-manager/headless-breadcrumb-manager.ssr.js';
export type {
  Context,
  ContextDefinition,
  ContextInitialState,
  ContextPayload,
  ContextProps,
  ContextState,
  ContextValue,
} from './ssr/search/controllers/context/headless-context.ssr.js';
export {defineContext} from './ssr/search/controllers/context/headless-context.ssr.js';
export type {
  DictionaryFieldContext,
  DictionaryFieldContextDefinition,
  DictionaryFieldContextPayload,
  DictionaryFieldContextState,
} from './ssr/search/controllers/dictionary-field-context/headless-dictionary-field-context.ssr.js';
export {defineDictionaryFieldContext} from './ssr/search/controllers/dictionary-field-context/headless-dictionary-field-context.ssr.js';
export type {
  DidYouMean,
  DidYouMeanDefinition,
  DidYouMeanState,
  QueryCorrection,
  WordCorrection,
} from './ssr/search/controllers/did-you-mean/headless-did-you-mean.ssr.js';
export {defineDidYouMean} from './ssr/search/controllers/did-you-mean/headless-did-you-mean.ssr.js';
export type {
  FacetManager,
  FacetManagerDefinition,
  FacetManagerPayload,
  FacetManagerState,
} from './ssr/search/controllers/facet-manager/headless-facet-manager.ssr.js';
export {defineFacetManager} from './ssr/search/controllers/facet-manager/headless-facet-manager.ssr.js';
export type {
  AutomaticFacet,
  AutomaticFacetGenerator,
  AutomaticFacetGeneratorDefinition,
  AutomaticFacetGeneratorOptions,
  AutomaticFacetGeneratorProps,
  AutomaticFacetGeneratorState,
  AutomaticFacetState,
} from './ssr/search/controllers/facets/automatic-facet-generator/headless-automatic-facet-generator.ssr.js';
export {defineAutomaticFacetGenerator} from './ssr/search/controllers/facets/automatic-facet-generator/headless-automatic-facet-generator.ssr.js';
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
} from './ssr/search/controllers/facets/category-facet/headless-category-facet.ssr.js';
export {defineCategoryFacet} from './ssr/search/controllers/facets/category-facet/headless-category-facet.ssr.js';
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
} from './ssr/search/controllers/facets/facet/headless-facet.ssr.js';
export {defineFacet} from './ssr/search/controllers/facets/facet/headless-facet.ssr.js';
export type {
  DateFacet,
  DateFacetDefinition,
  DateFacetOptions,
  DateFacetProps,
  DateFacetState,
  DateRangeInput,
  DateRangeOptions,
} from './ssr/search/controllers/facets/range-facet/date-facet/headless-date-facet.ssr.js';
export {
  buildDateRange,
  defineDateFacet,
} from './ssr/search/controllers/facets/range-facet/date-facet/headless-date-facet.ssr.js';
export type {
  DateFilter,
  DateFilterDefinition,
  DateFilterInitialState,
  DateFilterOptions,
  DateFilterProps,
  DateFilterRange,
  DateFilterState,
} from './ssr/search/controllers/facets/range-facet/date-facet/headless-date-filter.ssr.js';
export {defineDateFilter} from './ssr/search/controllers/facets/range-facet/date-facet/headless-date-filter.ssr.js';
export type {
  NumericFacet,
  NumericFacetDefinition,
  NumericFacetOptions,
  NumericFacetProps,
  NumericFacetState,
  NumericRangeOptions,
} from './ssr/search/controllers/facets/range-facet/numeric-facet/headless-numeric-facet.ssr.js';
export {
  buildNumericRange,
  defineNumericFacet,
} from './ssr/search/controllers/facets/range-facet/numeric-facet/headless-numeric-facet.ssr.js';
export type {
  NumericFilter,
  NumericFilterDefinition,
  NumericFilterInitialState,
  NumericFilterOptions,
  NumericFilterProps,
  NumericFilterRange,
  NumericFilterState,
} from './ssr/search/controllers/facets/range-facet/numeric-facet/headless-numeric-filter.ssr.js';
export {defineNumericFilter} from './ssr/search/controllers/facets/range-facet/numeric-facet/headless-numeric-filter.ssr.js';
export type {
  CategoryFieldSuggestions,
  CategoryFieldSuggestionsDefinition,
  CategoryFieldSuggestionsOptions,
  CategoryFieldSuggestionsProps,
  CategoryFieldSuggestionsState,
  CategoryFieldSuggestionsValue,
} from './ssr/search/controllers/field-suggestions/category-facet/headless-category-field-suggestions.ssr.js';
export {defineCategoryFieldSuggestions} from './ssr/search/controllers/field-suggestions/category-facet/headless-category-field-suggestions.ssr.js';
export type {
  FieldSuggestions,
  FieldSuggestionsDefinition,
  FieldSuggestionsOptions,
  FieldSuggestionsProps,
  FieldSuggestionsState,
  FieldSuggestionsValue,
} from './ssr/search/controllers/field-suggestions/facet/headless-field-suggestions.ssr.js';
export {defineFieldSuggestions} from './ssr/search/controllers/field-suggestions/facet/headless-field-suggestions.ssr.js';
export type {
  FoldedCollection,
  FoldedResult,
  FoldedResultList,
  FoldedResultListDefinition,
  FoldedResultListOptions,
  FoldedResultListProps,
  FoldedResultListState,
  FoldingOptions,
} from './ssr/search/controllers/folded-result-list/headless-folded-result-list.ssr.js';
export {defineFoldedResultList} from './ssr/search/controllers/folded-result-list/headless-folded-result-list.ssr.js';
export type {
  HistoryManager,
  HistoryManagerDefinition,
  HistoryManagerState,
} from './ssr/search/controllers/history-manager/headless-history-manager.ssr.js';
export {defineHistoryManager} from './ssr/search/controllers/history-manager/headless-history-manager.ssr.js';
export type {
  InstantResultOptions,
  InstantResultProps,
  InstantResults,
  InstantResultsDefinition,
  InstantResultsState,
} from './ssr/search/controllers/instant-results/instant-results.ssr.js';
export {defineInstantResults} from './ssr/search/controllers/instant-results/instant-results.ssr.js';
export type {
  Pager,
  PagerDefinition,
  PagerInitialState,
  PagerOptions,
  PagerProps,
  PagerState,
} from './ssr/search/controllers/pager/headless-pager.ssr.js';
export {definePager} from './ssr/search/controllers/pager/headless-pager.ssr.js';
export type {
  QueryError,
  QueryErrorDefinition,
  QueryErrorState,
} from './ssr/search/controllers/query-error/headless-query-error.ssr.js';
export {defineQueryError} from './ssr/search/controllers/query-error/headless-query-error.ssr.js';
export type {
  QuerySummary,
  QuerySummaryDefinition,
  QuerySummaryState,
} from './ssr/search/controllers/query-summary/headless-query-summary.ssr.js';
export {defineQuerySummary} from './ssr/search/controllers/query-summary/headless-query-summary.ssr.js';
export type {
  CoreQuickview,
  CoreQuickviewState,
  Quickview,
  QuickviewDefinition,
  QuickviewOptions,
  QuickviewProps,
  QuickviewState,
} from './ssr/search/controllers/quickview/headless-quickview.ssr.js';
export {defineQuickview} from './ssr/search/controllers/quickview/headless-quickview.ssr.js';
export type {
  RecentQueriesList,
  RecentQueriesListDefinition,
  RecentQueriesListInitialState,
  RecentQueriesListOptions,
  RecentQueriesListProps,
  RecentQueriesState,
} from './ssr/search/controllers/recent-queries-list/headless-recent-queries-list.ssr.js';
export {defineRecentQueriesList} from './ssr/search/controllers/recent-queries-list/headless-recent-queries-list.ssr.js';
export type {
  RecentResultsList,
  RecentResultsListDefinition,
  RecentResultsListInitialState,
  RecentResultsListOptions,
  RecentResultsListProps,
  RecentResultsState,
} from './ssr/search/controllers/recent-results-list/headless-recent-results-list.ssr.js';
export {defineRecentResultsList} from './ssr/search/controllers/recent-results-list/headless-recent-results-list.ssr.js';
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
} from './ssr/search/controllers/relevance-inspector/headless-relevance-inspector.ssr.js';
export {defineRelevanceInspector} from './ssr/search/controllers/relevance-inspector/headless-relevance-inspector.ssr.js';
export type {
  ResultList,
  ResultListDefinition,
  ResultListOptions,
  ResultListProps,
  ResultListState,
} from './ssr/search/controllers/result-list/headless-result-list.ssr.js';
export {defineResultList} from './ssr/search/controllers/result-list/headless-result-list.ssr.js';
export type {
  ResultsPerPage,
  ResultsPerPageDefinition,
  ResultsPerPageInitialState,
  ResultsPerPageProps,
  ResultsPerPageState,
} from './ssr/search/controllers/results-per-page/headless-results-per-page.ssr.js';
export {defineResultsPerPage} from './ssr/search/controllers/results-per-page/headless-results-per-page.ssr.js';
export type {
  Delimiters,
  SearchBox,
  SearchBoxDefinition,
  SearchBoxOptions,
  SearchBoxProps,
  SearchBoxState,
  Suggestion,
  SuggestionHighlightingOptions,
} from './ssr/search/controllers/search-box/headless-search-box.ssr.js';
export {defineSearchBox} from './ssr/search/controllers/search-box/headless-search-box.ssr.js';
export type {
  SearchParameterManager,
  SearchParameterManagerBuildProps,
  SearchParameterManagerDefinition,
  SearchParameterManagerInitialState,
  SearchParameterManagerState,
  SearchParameters,
} from './ssr/search/controllers/search-parameter-manager/headless-search-parameter-manager.ssr.js';
export {defineSearchParameterManager} from './ssr/search/controllers/search-parameter-manager/headless-search-parameter-manager.ssr.js';
export type {
  SearchStatus,
  SearchStatusDefinition,
  SearchStatusState,
} from './ssr/search/controllers/search-status/headless-search-status.ssr.js';
export {defineSearchStatus} from './ssr/search/controllers/search-status/headless-search-status.ssr.js';
export type {
  QuestionAnswerDocumentIdentifier,
  SmartSnippet,
  SmartSnippetCore,
  SmartSnippetDefinition,
  SmartSnippetOptions,
  SmartSnippetProps,
  SmartSnippetState,
} from './ssr/search/controllers/smart-snippet/headless-smart-snippet.ssr.js';
export {defineSmartSnippet} from './ssr/search/controllers/smart-snippet/headless-smart-snippet.ssr.js';
export type {
  CoreSmartSnippetQuestionsList,
  CoreSmartSnippetQuestionsListState,
  SmartSnippetQuestionsList,
  SmartSnippetQuestionsListDefinition,
  SmartSnippetQuestionsListOptions,
  SmartSnippetQuestionsListProps,
  SmartSnippetQuestionsListState,
  SmartSnippetRelatedQuestion,
} from './ssr/search/controllers/smart-snippet-questions-list/headless-smart-snippet-questions-list.ssr.js';
export {defineSmartSnippetQuestionsList} from './ssr/search/controllers/smart-snippet-questions-list/headless-smart-snippet-questions-list.ssr.js';
export type {
  Sort,
  SortDefinition,
  SortInitialState,
  SortProps,
  SortState,
} from './ssr/search/controllers/sort/headless-sort.ssr.js';
export {defineSort} from './ssr/search/controllers/sort/headless-sort.ssr.js';
export type {
  StandaloneSearchBox,
  StandaloneSearchBoxAnalytics,
  StandaloneSearchBoxDefinition,
  StandaloneSearchBoxOptions,
  StandaloneSearchBoxProps,
  StandaloneSearchBoxState,
} from './ssr/search/controllers/standalone-search-box/headless-standalone-search-box.ssr.js';
export {defineStandaloneSearchBox} from './ssr/search/controllers/standalone-search-box/headless-standalone-search-box.ssr.js';
export type {
  StaticFilter,
  StaticFilterDefinition,
  StaticFilterOptions,
  StaticFilterProps,
  StaticFilterState,
  StaticFilterValue,
  StaticFilterValueOptions,
  StaticFilterValueState,
} from './ssr/search/controllers/static-filter/headless-static-filter.ssr.js';
export {
  buildStaticFilterValue,
  defineStaticFilter,
} from './ssr/search/controllers/static-filter/headless-static-filter.ssr.js';
export type {
  Tab,
  TabDefinition,
  TabInitialState,
  TabOptions,
  TabProps,
  TabState,
} from './ssr/search/controllers/tab/headless-tab.ssr.js';
export {defineTab} from './ssr/search/controllers/tab/headless-tab.ssr.js';
export type {
  TabManager,
  TabManagerState,
} from './ssr/search/controllers/tab-manager/headless-tab-manager.ssr.js';
export {defineTabManager} from './ssr/search/controllers/tab-manager/headless-tab-manager.ssr.js';
export type {
  ExecuteTrigger,
  ExecuteTriggerDefinition,
  ExecuteTriggerState,
} from './ssr/search/controllers/triggers/headless-execute-trigger.ssr.js';
export {defineExecuteTrigger} from './ssr/search/controllers/triggers/headless-execute-trigger.ssr.js';
export type {
  NotifyTrigger,
  NotifyTriggerDefinition,
  NotifyTriggerState,
} from './ssr/search/controllers/triggers/headless-notify-trigger.ssr.js';
export {defineNotifyTrigger} from './ssr/search/controllers/triggers/headless-notify-trigger.ssr.js';
export type {
  QueryTrigger,
  QueryTriggerDefinition,
  QueryTriggerState,
} from './ssr/search/controllers/triggers/headless-query-trigger.ssr.js';
export {defineQueryTrigger} from './ssr/search/controllers/triggers/headless-query-trigger.ssr.js';
export type {
  RedirectionTrigger,
  RedirectionTriggerDefinition,
  RedirectionTriggerState,
} from './ssr/search/controllers/triggers/headless-redirection-trigger.ssr.js';
export {defineRedirectionTrigger} from './ssr/search/controllers/triggers/headless-redirection-trigger.ssr.js';
export type {
  UrlManager,
  UrlManagerBuildProps,
  UrlManagerInitialState,
  UrlManagerProps,
  UrlManagerState,
} from './ssr/search/controllers/url-manager/headless-url-manager.ssr.js';
export {defineUrlManager} from './ssr/search/controllers/url-manager/headless-url-manager.ssr.js';
export type {
  SearchCompletedAction,
  SearchEngineDefinition,
  SearchEngineDefinitionOptions,
  SSRSearchEngine as SearchEngine,
} from './ssr/search/engine/search-engine.ssr.js';
export {defineSearchEngine} from './ssr/search/engine/search-engine.ssr.js';
// State
export type {
  SearchAppState,
  SearchParametersState,
} from './state/search-app-state.js';

//#endregion

export {
  getAnalyticsNextApiBaseUrl,
  getOrganizationEndpoint,
} from './api/platform-client.js';
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
export * from './features/facets/category-facet-set/category-facet-set-actions-loader.js';
export type {
  CategoryFacetSortCriterion,
  CategoryFacetValueRequest,
} from './features/facets/category-facet-set/interfaces/request.js';
export type {
  CategoryFacetValue,
  CategoryFacetValueCommon,
} from './features/facets/category-facet-set/interfaces/response.js';
export type {FacetResultsMustMatch} from './features/facets/facet-api/request.js';
export * from './features/facets/facet-set/facet-set-actions-loader.js';
// Selectors
export {
  baseFacetResponseSelector,
  facetRequestSelector,
  facetResponseSelectedValuesSelector,
  facetResponseSelector,
} from './features/facets/facet-set/facet-set-selectors.js';
export type {
  FacetSortCriterion,
  FacetValueRequest,
} from './features/facets/facet-set/interfaces/request.js';
export type {AnyFacetValueRequest} from './features/facets/generic/interfaces/generic-facet-request.js';
export * from './features/facets/range-facets/date-facet-set/date-facet-actions-loader.js';
export type {DateRangeRequest} from './features/facets/range-facets/date-facet-set/interfaces/request.js';
export type {DateFacetValue} from './features/facets/range-facets/date-facet-set/interfaces/response.js';
export type {
  RangeFacetRangeAlgorithm,
  RangeFacetSortCriterion,
} from './features/facets/range-facets/generic/interfaces/request.js';
export type {NumericRangeRequest} from './features/facets/range-facets/numeric-facet-set/interfaces/request.js';
export type {NumericFacetValue} from './features/facets/range-facets/numeric-facet-set/interfaces/response.js';
export * from './features/facets/range-facets/numeric-facet-set/numeric-facet-actions-loader.js';
export * from './features/fields/fields-actions-loader.js';
export {
  DefaultFieldsToInclude,
  EcommerceDefaultFieldsToInclude,
  MinimumFieldsToInclude,
} from './features/fields/fields-state.js';
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
export type {
  ResultTemplate,
  ResultTemplateCondition,
  ResultTemplatesManager,
} from './features/result-templates/result-templates-manager.js';
export {buildResultTemplatesManager} from './features/result-templates/result-templates-manager.js';
export * from './features/search/search-actions-loader.js';
export * from './features/search-hub/search-hub-actions-loader.js';
export {buildSearchParameterSerializer} from './features/search-parameters/search-parameter-serializer.js';
// Types & Helpers
export {buildSSRSearchParameterSerializer} from './features/search-parameters/search-parameter-serializer.ssr.js';
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
export * from './features/sort-criteria/sort-criteria-actions-loader.js';
export * from './features/standalone-search-box-set/standalone-search-box-set-actions-loader.js';
export * from './features/static-filter-set/static-filter-set-actions-loader.js';
export * from './features/tab-set/tab-set-actions-loader.js';
export type {FunctionExecutionTrigger} from './features/triggers/triggers-state.js';
export type {HighlightKeyword} from './utils/highlight.js';
export * from './utils/query-expression/query-expression.js';
export type {PlatformEnvironment} from './utils/url-utils.js';
export {VERSION} from './utils/version.js';
