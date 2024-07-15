import {polyfillCryptoNode} from './api/analytics/analytics-crypto-polyfill';
import * as HighlightUtils from './utils/highlight';

polyfillCryptoNode();
// 3rd Party Libraries
export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';
export type {Relay} from '@coveo/relay';

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
export type {NavigatorContext} from './app/navigatorContextProvider';

// Action loaders
export * from './features/insight-interface/insight-interface-actions-loader';
export * from './features/insight-search/insight-search-actions-loader';
export * from './features/insight-search/insight-query-set-actions-loader';
export * from './features/analytics/insight-analytics-actions-loader';
export * from './features/facets/range-facets/date-facet-set/date-facet-actions-loader';
export * from './features/facets/range-facets/numeric-facet-set/numeric-facet-actions-loader';
export * from './features/recent-results/recent-results-actions-loader';
export * from './features/facets/range-facets/date-facet-set/date-facet-actions-loader';
export * from './features/case-context/case-context-actions-loader';
export * from './features/context/context-actions-loader';
export * from './features/insight-search/insight-search-analytics-actions-loader';
export * from './features/fields/fields-actions-loader';
export * from './features/attached-results/attached-results-actions-loader';
export * from './features/analytics/generic-analytics-actions-loader';
export * from './features/question-answering/question-answering-actions-loader';
export * from './features/folding/folding-actions-loader';

// Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller';
export {buildController} from './controllers/controller/headless-controller';

export type {HighlightKeyword} from './utils/highlight';

export type {
  DidYouMean,
  DidYouMeanState,
  QueryCorrection,
  WordCorrection,
} from './controllers/insight/did-you-mean/headless-insight-did-you-mean';
export {buildDidYouMean} from './controllers/insight/did-you-mean/headless-insight-did-you-mean';

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
} from './controllers/insight/breadcrumb-manager/headless-insight-breadcrumb-manager';
export {buildBreadcrumbManager} from './controllers/insight/breadcrumb-manager/headless-insight-breadcrumb-manager';

export type {
  SearchParameterManagerProps,
  SearchParameterManagerInitialState,
  SearchParameterManagerState,
  SearchParameterManager,
  SearchParameters,
} from './controllers/insight/search-parameter-manager/headless-insight-search-parameter-manager';
export {buildSearchParameterManager} from './controllers/insight/search-parameter-manager/headless-insight-search-parameter-manager';

export type {
  FacetManagerPayload,
  FacetManagerState,
  FacetManager,
} from './controllers/insight/facet-manager/headless-insight-facet-manager';
export {buildFacetManager} from './controllers/insight/facet-manager/headless-insight-facet-manager';

export type {
  CategoryFacetValueRequest,
  CategoryFacetSortCriterion,
} from './features/facets/category-facet-set/interfaces/request';

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
} from './controllers/insight/facets/category-facet/headless-insight-category-facet';
export {buildCategoryFacet} from './controllers/insight/facets/category-facet/headless-insight-category-facet';

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
} from './controllers/insight/facets/facet/headless-insight-facet';
export {buildFacet} from './controllers/insight/facets/facet/headless-insight-facet';

export type {
  DateRangeOptions,
  DateRangeRequest,
  DateRangeInput,
  DateFacetOptions,
  DateFacetProps,
  DateFacetState,
  DateFacet,
} from './controllers/insight/facets/range-facet/date-facet/headless-insight-date-facet';
export {
  buildDateRange,
  buildDateFacet,
} from './controllers/insight/facets/range-facet/date-facet/headless-insight-date-facet';

export type {
  NumericRangeOptions,
  NumericRangeRequest,
  NumericFacetOptions,
  NumericFacetProps,
  NumericFacetState,
  NumericFacet,
} from './controllers/insight/facets/range-facet/numeric-facet/headless-insight-numeric-facet';
export {
  buildNumericRange,
  buildNumericFacet,
} from './controllers/insight/facets/range-facet/numeric-facet/headless-insight-numeric-facet';

export type {
  NumericFilter,
  NumericFilterOptions,
  NumericFilterProps,
  NumericFilterRange,
  NumericFilterState,
  NumericFilterInitialState,
} from './controllers/insight/facets/range-facet/numeric-facet/headless-insight-numeric-filter';
export {buildNumericFilter} from './controllers/insight/facets/range-facet/numeric-facet/headless-insight-numeric-filter';

export type {
  DateFilter,
  DateFilterOptions,
  DateFilterProps,
  DateFilterRange,
  DateFilterState,
  DateFilterInitialState,
} from './controllers/insight/facets/range-facet/date-facet/headless-insight-date-filter';
export {buildDateFilter} from './controllers/insight/facets/range-facet/date-facet/headless-insight-date-filter';

export type {
  PagerInitialState,
  PagerOptions,
  PagerProps,
  PagerState,
  Pager,
} from './controllers/insight/pager/headless-insight-pager';
export {buildPager} from './controllers/insight/pager/headless-insight-pager';

export type {
  AttachToCaseProps,
  AttachToCaseOptions,
  AttachToCase,
} from './controllers/insight/attach-to-case/headless-attach-to-case';
export {buildAttachToCase} from './controllers/insight/attach-to-case/headless-attach-to-case';

export type {
  QuerySummaryState,
  QuerySummary,
} from './controllers/insight/query-summary/headless-insight-query-summary';
export {buildQuerySummary} from './controllers/insight/query-summary/headless-insight-query-summary';

export type {
  QuickviewProps,
  QuickviewOptions,
  QuickviewState,
  Quickview,
} from './controllers/insight/quickview/headless-insight-quickview';
export {buildQuickview} from './controllers/insight/quickview/headless-insight-quickview';

export type {
  ResultListProps,
  ResultListOptions,
  ResultListState,
  ResultList,
} from './controllers/insight/result-list/headless-insight-result-list';
export {buildResultList} from './controllers/insight/result-list/headless-insight-result-list';

export type {
  FoldingOptions,
  FoldedCollection,
  FoldedResult,
  FoldedResultListOptions,
  InsightFoldedResultListProps,
  FoldedResultList,
  FoldedResultListState,
} from './controllers/insight/folded-result-list/headless-insight-folded-result-list';
export {buildFoldedResultList} from './controllers/insight/folded-result-list/headless-insight-folded-result-list';

export type {
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
  InteractiveResultCore,
  InsightInteractiveResultOptions,
  InsightInteractiveResultProps,
  InteractiveResult,
} from './controllers/insight/result-list/headless-insight-interactive-result';
export {buildInteractiveResult} from './controllers/insight/result-list/headless-insight-interactive-result';

export type {
  ResultsPerPageInitialState,
  ResultsPerPageProps,
  ResultsPerPageState,
  ResultsPerPage,
} from './controllers/insight/results-per-page/headless-insight-results-per-page';
export {buildResultsPerPage} from './controllers/insight/results-per-page/headless-insight-results-per-page';

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

export type {
  SearchStatus,
  SearchStatusState,
} from './controllers/insight/status/headless-insight-status';
export {buildSearchStatus} from './controllers/insight/status/headless-insight-status';

export type {
  SortInitialState,
  SortProps,
  SortState,
  Sort,
} from './controllers/insight/sort/headless-insight-sort';
export {buildSort} from './controllers/insight/sort/headless-insight-sort';

export type {
  TabInitialState,
  TabOptions,
  TabProps,
  TabState,
  Tab,
} from './controllers/insight/tab/headless-insight-tab';
export {buildTab} from './controllers/insight/tab/headless-insight-tab';

export type {
  FacetConditionsManager,
  FacetConditionsManagerProps,
  AnyFacetValuesCondition,
} from './controllers/insight/facet-conditions-manager/headless-facet-conditions-manager';
export {buildFacetConditionsManager} from './controllers/insight/facet-conditions-manager/headless-facet-conditions-manager';

export type {InsightInterfaceState} from './features/insight-interface/insight-interface-state';

export type {InsightInterface} from './controllers/insight-interface/insight-interface';
export {buildInsightInterface} from './controllers/insight-interface/insight-interface';

export type {
  InlineLink,
  SmartSnippet,
  SmartSnippetOptions,
  SmartSnippetProps,
  SmartSnippetState,
  QuestionAnswerDocumentIdentifier,
  SmartSnippetCore,
} from './controllers/insight/smart-snippet/headless-insight-smart-snippet';
export {buildSmartSnippet} from './controllers/insight/smart-snippet/headless-insight-smart-snippet';

export type {
  SmartSnippetQuestionsListOptions,
  SmartSnippetQuestionsListProps,
  SmartSnippetQuestionsListState,
  SmartSnippetQuestionsList,
  SmartSnippetRelatedQuestion,
  CoreSmartSnippetQuestionsList,
  CoreSmartSnippetQuestionsListState,
} from './controllers/insight/smart-snippet-questions-list/headless-insight-smart-snippet-questions-list';
export {buildSmartSnippetQuestionsList} from './controllers/insight/smart-snippet-questions-list/headless-insight-smart-snippet-questions-list';

export type {
  GeneratedAnswer,
  GeneratedAnswerState,
  GeneratedAnswerProps,
} from './controllers/insight/generated-answer/headless-insight-generated-answer';
export {buildGeneratedAnswer} from './controllers/insight/generated-answer/headless-insight-generated-answer';

export type {
  InteractiveCitation,
  InteractiveCitationProps,
  InteractiveCitationOptions,
} from './controllers/insight/generated-answer/headless-insight-interactive-citation';
export {buildInteractiveCitation} from './controllers/insight/generated-answer/headless-insight-interactive-citation';
export type {GeneratedAnswerStyle} from './features/generated-answer/generated-response-format';
// Features
export type {
  ResultTemplate,
  ResultTemplateCondition,
} from './features/result-templates/result-templates-manager';
export type {ResultTemplatesManager} from './features/result-templates/result-templates-manager';
export {buildResultTemplatesManager} from './features/result-templates/result-templates-manager';
export {ResultTemplatesHelpers} from './features/result-templates/result-templates-helpers';

export type {NumericFacetValue} from './features/facets/range-facets/numeric-facet-set/interfaces/response';

export type {DateFacetValue} from './features/facets/range-facets/date-facet-set/interfaces/response';

export type {
  QueryError,
  QueryErrorState,
} from './controllers/insight/query-error/headless-insight-query-error';
export {buildQueryError} from './controllers/insight/query-error/headless-insight-query-error';

export type {
  FacetValueRequest,
  FacetSortCriterion,
} from './features/facets/facet-set/interfaces/request';

export type {
  RangeFacetSortCriterion,
  RangeFacetRangeAlgorithm,
} from './features/facets/range-facets/generic/interfaces/request';

export type {
  UserActions,
  UserActionsProps,
  UserActionsOptions,
  UserActionsState,
} from './controllers/insight/user-actions/headless-user-actions';
export {buildUserActions} from './controllers/insight/user-actions/headless-user-actions';

// Types & Helpers
export type {Raw} from './api/search/search/raw';
export type {InsightAPIErrorStatusResponse} from './api/service/insight/insight-api-client';
export type {Result} from './api/search/search/result';
export {HighlightUtils};

export {
  SortOrder,
  buildDateSortCriterion,
  buildCriterionExpression,
  buildRelevanceSortCriterion,
} from './features/sort-criteria/criteria';

export type {
  RelativeDate,
  RelativeDatePeriod,
  RelativeDateUnit,
} from './api/search/date/relative-date';

export {deserializeRelativeDate} from './api/search/date/relative-date';

export {getOrganizationEndpoints} from './api/platform-client';
export type {PlatformEnvironment} from './utils/url-utils';
