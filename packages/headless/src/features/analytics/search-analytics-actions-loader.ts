import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {logDidYouMeanClick} from '../did-you-mean/did-you-mean-analytics-actions.js';
import {
  type LogCategoryFacetBreadcrumbActionCreatorPayload,
  logCategoryFacetBreadcrumb,
} from '../facets/category-facet-set/category-facet-set-analytics-actions.js';
import {
  type LogFacetBreadcrumbActionCreatorPayload,
  type LogFacetDeselectActionCreatorPayload,
  type LogFacetExcludeActionCreatorPayload,
  type LogFacetSelectActionCreatorPayload,
  type LogFacetUnexcludeActionCreatorPayload,
  type LogFacetUpdateSortActionCreatorPayload,
  logFacetBreadcrumb,
  logFacetClearAll,
  logFacetDeselect,
  logFacetExclude,
  logFacetSelect,
  logFacetShowLess,
  logFacetShowMore,
  logFacetUnexclude,
  logFacetUpdateSort,
} from '../facets/facet-set/facet-set-analytics-actions.js';
import {logClearBreadcrumbs} from '../facets/generic/facet-generic-analytics-actions.js';
import {
  type LogDateFacetBreadcrumbActionCreatorPayload,
  logDateFacetBreadcrumb,
} from '../facets/range-facets/date-facet-set/date-facet-analytics-actions.js';
import {
  type LogNumericFacetBreadcrumbActionCreatorPayload,
  logNumericFacetBreadcrumb,
} from '../facets/range-facets/numeric-facet-set/numeric-facet-analytics-actions.js';
import {
  logNavigateBackward,
  logNavigateForward,
  logNoResultsBack,
} from '../history/history-analytics-actions.js';
import {
  logPageNext,
  logPageNumber,
  logPagePrevious,
  logPagerResize,
} from '../pagination/pagination-analytics-actions.js';
import {logSearchboxSubmit} from '../query/query-analytics-actions.js';
import {
  type LogQuerySuggestionClickActionCreatorPayload,
  logQuerySuggestionClick,
  type OmniboxSuggestionMetadata,
} from '../query-suggest/query-suggest-analytics-actions.js';
import {
  logCloseSmartSnippetFeedbackModal,
  logCollapseSmartSnippet,
  logCollapseSmartSnippetSuggestion,
  logDislikeSmartSnippet,
  logExpandSmartSnippet,
  logExpandSmartSnippetSuggestion,
  logLikeSmartSnippet,
  logOpenSmartSnippetFeedbackModal,
  logSmartSnippetDetailedFeedback,
  logSmartSnippetFeedback,
  type SmartSnippetFeedback,
} from '../question-answering/question-answering-analytics-actions.js';
import type {
  QuestionAnsweringInlineLinkActionCreatorPayload,
  QuestionAnsweringUniqueIdentifierActionCreatorPayload,
} from '../question-answering/question-answering-document-id.js';
import {logResultsSort} from '../sort-criteria/sort-criteria-analytics-actions.js';
import {
  type LogStaticFilterClearAllActionCreatorPayload,
  type LogStaticFilterToggleValueActionCreatorPayload,
  logStaticFilterClearAll,
  logStaticFilterDeselect,
  logStaticFilterSelect,
  type StaticFilterValueMetadata,
} from '../static-filter-set/static-filter-set-actions.js';
import {
  type LogUndoTriggerQueryActionCreatorPayload,
  logNotifyTrigger,
  logTriggerExecute,
  logTriggerQuery,
  logTriggerRedirect,
  logUndoTriggerQuery,
} from '../triggers/trigger-analytics-actions.js';
import {
  logInterfaceChange,
  logInterfaceLoad,
  logOmniboxFromLink,
  logSearchFromLink,
} from './analytics-actions.js';
import type {CustomAction, LegacySearchAction} from './analytics-utils.js';

export type {
  LogCategoryFacetBreadcrumbActionCreatorPayload,
  LogFacetBreadcrumbActionCreatorPayload,
  LogFacetExcludeActionCreatorPayload,
  LogFacetUnexcludeActionCreatorPayload,
  LogFacetDeselectActionCreatorPayload,
  LogFacetSelectActionCreatorPayload,
  LogFacetUpdateSortActionCreatorPayload,
  LogDateFacetBreadcrumbActionCreatorPayload,
  LogNumericFacetBreadcrumbActionCreatorPayload,
  LogQuerySuggestionClickActionCreatorPayload,
  QuestionAnsweringUniqueIdentifierActionCreatorPayload,
  QuestionAnsweringInlineLinkActionCreatorPayload,
  LogStaticFilterToggleValueActionCreatorPayload,
  LogStaticFilterClearAllActionCreatorPayload,
  StaticFilterValueMetadata,
  SmartSnippetFeedback,
  LogUndoTriggerQueryActionCreatorPayload,
};

/**
 * The search analytics action creators.
 *
 * @group Actions
 * @category Analytics
 */
export interface SearchAnalyticsActionCreators {
  /**
   * The event to log when clearing breadcrumbs.
   *
   * @returns A dispatchable action.
   */
  logClearBreadcrumbs(): LegacySearchAction;

  /**
   * The event to log when a search interface loads for the first time.
   *
   * @returns A dispatchable action.
   */
  logInterfaceLoad(): LegacySearchAction;

  /**
   * The event to log when a search interface loads for the first time, for a user who performed a search using a standalone search box.
   *
   * @returns A dispatchable action.
   */
  logSearchFromLink(): LegacySearchAction;

  /**
   * The event to log when a search interface loads for the first time, for a user who selected a query suggestion from a standalone search box.
   *
   * @param metadata - The metadata of the clicked query suggestion that triggered the redirect.
   * @returns A dispatchable action.
   */
  logOmniboxFromLink(metadata: OmniboxSuggestionMetadata): LegacySearchAction;

  /**
   * The event to log when a tab is selected.
   *
   * @returns A dispatchable action.
   */
  logInterfaceChange(): LegacySearchAction;

  /**
   * The event to log when a user triggers a search by clicking a did-you-mean suggestion.
   *
   * @returns A dispatchable action.
   */
  logDidYouMeanClick(): LegacySearchAction;

  /**
   * The event to log when a category facet breadcrumb is deselected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logCategoryFacetBreadcrumb(
    payload: LogCategoryFacetBreadcrumbActionCreatorPayload
  ): LegacySearchAction;

  /**
   * The event to log when a facet breadcrumb is deselected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetBreadcrumb(
    payload: LogFacetBreadcrumbActionCreatorPayload
  ): LegacySearchAction;

  /**
   * The event to log when all selected values in a facet are deselected.
   *
   * @param facetId - The facet id.
   * @returns A dispatchable action.
   */
  logFacetClearAll(facetId: string): LegacySearchAction;

  /**
   * The event to log when a selected facet value is deselected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetDeselect(
    payload: LogFacetDeselectActionCreatorPayload
  ): LegacySearchAction;

  /**
   * The event to log when an idle facet value is selected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetSelect(
    payload: LogFacetSelectActionCreatorPayload
  ): LegacySearchAction;

  /**
   * The event to log when a selected facet value is unexcluded.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetUnexclude(
    payload: LogFacetDeselectActionCreatorPayload
  ): LegacySearchAction;

  /**
   * The event to log when an idle facet value is excluded.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetExclude(
    payload: LogFacetSelectActionCreatorPayload
  ): LegacySearchAction;

  /**
   * The event to log when shrinking a facet to show fewer values.
   *
   * @param facetId - The facet id.
   * @returns A dispatchable action.
   */
  logFacetShowLess(facetId: string): LegacySearchAction;

  /**
   * The event to log when expanding a facet to show more values.
   *
   * @param facetId - The facet id.
   * @returns A dispatchable action.
   */
  logFacetShowMore(facetId: string): LegacySearchAction;

  /**
   * The event to log when the facet sort criterion is changed.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetUpdateSort(
    payload: LogFacetUpdateSortActionCreatorPayload
  ): LegacySearchAction;

  /**
   * The event to log when a date facet breadcrumb is deselected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logDateFacetBreadcrumb(
    payload: LogDateFacetBreadcrumbActionCreatorPayload
  ): LegacySearchAction;

  /**
   * The event to log when a numeric facet breadcrumb is deselected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logNumericFacetBreadcrumb(
    payload: LogNumericFacetBreadcrumbActionCreatorPayload
  ): LegacySearchAction;

  /**
   * The event to log when going to the previous state of the search interface.
   *
   * @returns A dispatchable action.
   */
  logNavigateBackward(): LegacySearchAction;

  /**
   * The event to log when going to the next state of the search interface.
   *
   * @returns A dispatchable action.
   */
  logNavigateForward(): LegacySearchAction;

  /**
   * The event to log when navigating to the next page of results.
   *
   * @returns A dispatchable action.
   */
  logPageNext(): LegacySearchAction;

  /**
   * The event to log when selecting a page in the pager.
   *
   * @returns A dispatchable action.
   */
  logPageNumber(): LegacySearchAction;

  /**
   * The event to log when navigating to the previous page of results.
   *
   * @returns A dispatchable action.
   */
  logPagePrevious(): LegacySearchAction;

  /**
   * The event to log when changing the number of results per page.
   *
   * @returns A dispatchable action.
   */
  logPagerResize(): LegacySearchAction;

  /**
   * The event to log when performing a search using a search box.
   *
   * @returns A dispatchable action.
   */
  logSearchboxSubmit(): LegacySearchAction;

  /**
   * The event to log when a query suggestion is selected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logQuerySuggestionClick(
    payload: LogQuerySuggestionClickActionCreatorPayload
  ): LegacySearchAction;

  /**
   * The event to log when the results sort criterion is changed.
   *
   * @returns A dispatchable action.
   */
  logResultsSort(): LegacySearchAction;

  /**
   * The event to log when a smart snippet is collapsed.
   *
   * @returns A dispatchable action.
   */
  logCollapseSmartSnippet(): CustomAction;

  /**
   * The event to log when a smart snippet is expanded.
   *
   * @returns A dispatchable action.
   */
  logExpandSmartSnippet(): CustomAction;

  /**
   * The event to log when a user provides negative feedback for a given smart snippet answer.
   *
   * @returns A dispatchable action.
   */
  logDislikeSmartSnippet(): CustomAction;

  /**
   * The event to log when a user provides positive feedback for a given smart snippet answer.
   *
   * @returns A dispatchable action.
   */
  logLikeSmartSnippet(): CustomAction;

  /**
   * The event to log when a user wishes to provide feedback about why the smart snippet answer wasn't relevant.
   *
   * @returns A dispatchable action.
   */
  logOpenSmartSnippetFeedbackModal(): CustomAction;

  /**
   * The event to log when a user no longer wishes to provide feedback about why the smart snippet answer wasn't relevant.
   *
   * @returns A dispatchable action.
   */
  logCloseSmartSnippetFeedbackModal(): CustomAction;

  /**
   * The event to log when a user provides feedback about why the smart snippet answer wasn't relevant.
   *
   * @param feedback - The generic feedback that the end user wishes to send.
   * @returns A dispatchable action.
   */
  logSmartSnippetFeedback(feedback: SmartSnippetFeedback): CustomAction;

  /**
   * The event to log when a user provides detailed feedback about why the smart snippet answer wasn't relevant.
   *
   * @param details - A personalized message from the end user about the relevance of the answer.
   * @returns A dispatchable action.
   */
  logSmartSnippetDetailedFeedback(details: string): CustomAction;

  /**
   * The event to log when a query suggestion is selected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logExpandSmartSnippetSuggestion(
    payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
  ): CustomAction;

  /**
   * The event to log when a smart snippet suggestion, or related question, is collapsed.
   *
   * @param payload - The action creation payload.
   * @returns A dispatchable action.
   */
  logCollapseSmartSnippetSuggestion(
    payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
  ): CustomAction;

  /**
   * The event to log when no results is shown and the end users cancel last action.
   *
   * @param payload - The action creation payload.
   * @returns A dispatchable action.
   */
  logNoResultsBack(): LegacySearchAction;

  /**
   * The event to log when a static filter value is selected.
   *
   * @param payload - The action creation payload.
   * @returns A dispatchable action.
   */
  logStaticFilterSelect(
    payload: LogStaticFilterToggleValueActionCreatorPayload
  ): LegacySearchAction;

  /**
   * The event to log when a static filter value is deselected.
   *
   * @param payload - The action creation payload.
   * @returns A dispatchable action.
   */
  logStaticFilterDeselect(
    payload: LogStaticFilterToggleValueActionCreatorPayload
  ): LegacySearchAction;

  /**
   * The event to log when all selected values of a static filter are deselected.
   *
   * @param payload - The action creation payload.
   * @returns A dispatchable action.
   */
  logStaticFilterClearAll(
    payload: LogStaticFilterClearAllActionCreatorPayload
  ): LegacySearchAction;

  /**
   * The event to log when a user action triggers a new query set in the effective query pipeline on the search page.
   *
   * @returns A dispatchable action.
   */
  logTriggerQuery(): LegacySearchAction;

  /**
   * The event to log when a user undoes a query set in the effective query pipeline on the search page.
   *
   * @param payload - The action creation payload.
   * @returns A dispatchable action.
   */
  logUndoTriggerQuery(
    payload: LogUndoTriggerQueryActionCreatorPayload
  ): LegacySearchAction;

  /**
   * The event to log when a user action triggers a notification set in the effective query pipeline on the search page.
   *
   * @returns A dispatchable action.
   */
  logNotifyTrigger(): LegacySearchAction;

  /**
   * The event to log when a user action redirects them to a URL set in the effective query pipeline on the search page.
   *
   * @returns A dispatchable action.
   */
  logTriggerRedirect(): LegacySearchAction;

  /**
   * The event to log when a user action executes a JavaScript function set in the effective query pipeline on the search page.
   *
   * @returns A dispatchable action.
   */
  logTriggerExecute(): LegacySearchAction;
}

/**
 * Returns possible search analytics action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 *
 * @group Actions
 * @category Analytics
 */
export function loadSearchAnalyticsActions(
  engine: SearchEngine
): SearchAnalyticsActionCreators {
  engine.addReducers({});

  return {
    logClearBreadcrumbs,
    logInterfaceLoad,
    logSearchFromLink,
    logOmniboxFromLink,
    logInterfaceChange,
    logDidYouMeanClick,
    logCategoryFacetBreadcrumb,
    logFacetBreadcrumb,
    logFacetClearAll,
    logFacetUnexclude,
    logFacetExclude,
    logFacetDeselect,
    logFacetSelect,
    logFacetShowLess,
    logFacetShowMore,
    logFacetUpdateSort,
    logDateFacetBreadcrumb,
    logNumericFacetBreadcrumb,
    logNavigateBackward,
    logNavigateForward,
    logPageNext,
    logPageNumber,
    logPagePrevious,
    logPagerResize,
    logSearchboxSubmit,
    logQuerySuggestionClick,
    logResultsSort,
    logDislikeSmartSnippet,
    logLikeSmartSnippet,
    logOpenSmartSnippetFeedbackModal,
    logCloseSmartSnippetFeedbackModal,
    logSmartSnippetFeedback,
    logSmartSnippetDetailedFeedback,
    logExpandSmartSnippet,
    logCollapseSmartSnippet,
    logExpandSmartSnippetSuggestion,
    logCollapseSmartSnippetSuggestion,
    logNoResultsBack,
    logStaticFilterSelect,
    logStaticFilterDeselect,
    logStaticFilterClearAll,
    logTriggerQuery,
    logUndoTriggerQuery,
    logNotifyTrigger,
    logTriggerRedirect,
    logTriggerExecute,
  };
}
