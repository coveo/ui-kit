import {AsyncThunkAction} from '@reduxjs/toolkit';
import {StateNeededBySearchAnalyticsProvider} from '../../api/analytics/search-analytics';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {logDidYouMeanClick} from '../did-you-mean/did-you-mean-analytics-actions';
import {
  logCategoryFacetBreadcrumb,
  LogCategoryFacetBreadcrumbActionCreatorPayload,
} from '../facets/category-facet-set/category-facet-set-analytics-actions';
import {
  logFacetBreadcrumb,
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
  logFacetShowLess,
  logFacetShowMore,
  logFacetUpdateSort,
  LogFacetBreadcrumbActionCreatorPayload,
  LogFacetDeselectActionCreatorPayload,
  LogFacetSelectActionCreatorPayload,
  LogFacetUpdateSortActionCreatorPayload,
} from '../facets/facet-set/facet-set-analytics-actions';
import {logClearBreadcrumbs} from '../facets/generic/facet-generic-analytics-actions';
import {
  logDateFacetBreadcrumb,
  LogDateFacetBreadcrumbActionCreatorPayload,
} from '../facets/range-facets/date-facet-set/date-facet-analytics-actions';
import {
  logNumericFacetBreadcrumb,
  LogNumericFacetBreadcrumbActionCreatorPayload,
} from '../facets/range-facets/numeric-facet-set/numeric-facet-analytics-actions';
import {
  logNavigateBackward,
  logNavigateForward,
  logNoResultsBack,
} from '../history/history-analytics-actions';
import {
  logPageNext,
  logPageNumber,
  logPagePrevious,
  logPagerResize,
} from '../pagination/pagination-analytics-actions';
import {
  logQuerySuggestionClick,
  LogQuerySuggestionClickActionCreatorPayload,
  OmniboxSuggestionMetadata,
} from '../query-suggest/query-suggest-analytics-actions';
import {logSearchboxSubmit} from '../query/query-analytics-actions';
import {
  logCollapseSmartSnippet,
  logExpandSmartSnippet,
  logDislikeSmartSnippet,
  logLikeSmartSnippet,
  logOpenSmartSnippetFeedbackModal,
  logCloseSmartSnippetFeedbackModal,
  logSmartSnippetFeedback,
  logSmartSnippetDetailedFeedback,
  logCollapseSmartSnippetSuggestion,
  logExpandSmartSnippetSuggestion,
  SmartSnippetFeedback,
} from '../question-answering/question-answering-analytics-actions';
import {
  QuestionAnsweringDocumentIdActionCreatorPayload,
  QuestionAnsweringInlineLinkActionCreatorPayload,
  QuestionAnsweringUniqueIdentifierActionCreatorPayload,
} from '../question-answering/question-answering-document-id';
import {logResultsSort} from '../sort-criteria/sort-criteria-analytics-actions';
import {
  logStaticFilterSelect,
  logStaticFilterDeselect,
  logStaticFilterClearAll,
  LogStaticFilterToggleValueActionCreatorPayload,
  LogStaticFilterClearAllActionCreatorPayload,
  StaticFilterValueMetadata,
} from '../static-filter-set/static-filter-set-actions';
import {
  logNotifyTrigger,
  logTriggerExecute,
  logTriggerQuery,
  logTriggerRedirect,
  logUndoTriggerQuery,
  LogUndoTriggerQueryActionCreatorPayload,
} from '../triggers/trigger-analytics-actions';
import {
  logInterfaceChange,
  logInterfaceLoad,
  logSearchFromLink,
  logOmniboxFromLink,
} from './analytics-actions';
import {
  AnalyticsType,
  AsyncThunkAnalyticsOptions,
  AsyncThunkInsightAnalyticsOptions,
} from './analytics-utils';

export type {
  LogCategoryFacetBreadcrumbActionCreatorPayload,
  LogFacetBreadcrumbActionCreatorPayload,
  LogFacetDeselectActionCreatorPayload,
  LogFacetSelectActionCreatorPayload,
  LogFacetUpdateSortActionCreatorPayload,
  LogDateFacetBreadcrumbActionCreatorPayload,
  LogNumericFacetBreadcrumbActionCreatorPayload,
  LogQuerySuggestionClickActionCreatorPayload,
  QuestionAnsweringDocumentIdActionCreatorPayload,
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
 */
export interface SearchAnalyticsActionCreators {
  /**
   * The event to log when clearing breadcrumbs.
   *
   * @returns A dispatchable action.
   */
  logClearBreadcrumbs(): AsyncThunkAction<
    {analyticsType: AnalyticsType.Search},
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a search interface loads for the first time.
   *
   * @returns A dispatchable action.
   */
  logInterfaceLoad(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a search interface loads for the first time, for a user who performed a search using a standalone search box.
   *
   * @returns A dispatchable action.
   */
  logSearchFromLink(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a search interface loads for the first time, for a user who selected a query suggestion from a standalone search box.
   *
   * @param metadata - The metadata of the clicked query suggestion that triggered the redirect.
   * @returns A dispatchable action.
   */
  logOmniboxFromLink(metadata: OmniboxSuggestionMetadata): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a tab is selected.
   *
   * @returns A dispatchable action.
   */
  logInterfaceChange(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a user triggers a search by clicking on a did-you-mean suggestion.
   *
   * @returns A dispatchable action.
   */
  logDidYouMeanClick(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a category facet breadcrumb is deselected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logCategoryFacetBreadcrumb(
    payload: LogCategoryFacetBreadcrumbActionCreatorPayload
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a facet breadcrumb is deselected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetBreadcrumb(
    payload: LogFacetBreadcrumbActionCreatorPayload
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when all selected values in a facet are deselected.
   *
   * @param facetId - The facet id.
   * @returns A dispatchable action.
   */
  logFacetClearAll(facetId: string): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a selected facet value is deselected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetDeselect(
    payload: LogFacetDeselectActionCreatorPayload
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when an idle facet value is selected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetSelect(payload: LogFacetSelectActionCreatorPayload): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when shrinking a facet to show fewer values.
   *
   * @param facetId - The facet id.
   * @returns A dispatchable action.
   */
  logFacetShowLess(facetId: string): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when expanding a facet to show more values.
   *
   * @param facetId - The facet id.
   * @returns A dispatchable action.
   */
  logFacetShowMore(facetId: string): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when the facet sort criterion is changed.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetUpdateSort(
    payload: LogFacetUpdateSortActionCreatorPayload
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a date facet breadcrumb is deselected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logDateFacetBreadcrumb(
    payload: LogDateFacetBreadcrumbActionCreatorPayload
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a numeric facet breadcrumb is deselected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logNumericFacetBreadcrumb(
    payload: LogNumericFacetBreadcrumbActionCreatorPayload
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when going to the previous state of the search interface.
   *
   * @returns A dispatchable action.
   */
  logNavigateBackward(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when going to the next state of the search interface.
   *
   * @returns A dispatchable action.
   */
  logNavigateForward(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when navigating to the next page of results.
   *
   * @returns A dispatchable action.
   */
  logPageNext(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when selecting a page in the pager.
   *
   * @returns A dispatchable action.
   */
  logPageNumber(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when navigating to the previous page of results.
   *
   * @returns A dispatchable action.
   */
  logPagePrevious(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when changing the number of results per page.
   *
   * @returns A dispatchable action.
   */
  logPagerResize(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when performing a search using a search box.
   *
   * @returns A dispatchable action.
   */
  logSearchboxSubmit(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a query suggestion is selected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logQuerySuggestionClick(
    payload: LogQuerySuggestionClickActionCreatorPayload
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when the results sort criterion is changed.
   *
   * @returns A dispatchable action.
   */
  logResultsSort(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a smart snippet is collapsed.
   *
   * @returns A dispatchable action.
   */
  logCollapseSmartSnippet(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Custom;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a smart snippet is expanded.
   *
   * @returns A dispatchable action.
   */
  logExpandSmartSnippet(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Custom;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a user provides negative feedback for a given smart snippet answer.
   *
   * @returns A dispatchable action.
   */
  logDislikeSmartSnippet(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Custom;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a user provides positive feedback for a given smart snippet answer.
   *
   * @returns A dispatchable action.
   */
  logLikeSmartSnippet(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Custom;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a user wishes to provide feedback about why the smart snippet answer wasn't relevant.
   *
   * @returns A dispatchable action.
   */
  logOpenSmartSnippetFeedbackModal(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Custom;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a user no longer wishes to provide feedback about why the smart snippet answer wasn't relevant.
   *
   * @returns A dispatchable action.
   */
  logCloseSmartSnippetFeedbackModal(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Custom;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a user provides feedback about why the smart snippet answer wasn't relevant.
   *
   * @param feedback - The generic feedback that the end user wishes to send.
   * @returns A dispatchable action.
   */
  logSmartSnippetFeedback(feedback: SmartSnippetFeedback): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Custom;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a user provides detailed feedback about why the smart snippet answer wasn't relevant.
   *
   * @param details - A personalized message from the end user about the relevance of the answer.
   * @returns A dispatchable action.
   */
  logSmartSnippetDetailedFeedback(details: string): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Custom;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a query suggestion is selected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logExpandSmartSnippetSuggestion(
    payload:
      | QuestionAnsweringDocumentIdActionCreatorPayload
      | QuestionAnsweringUniqueIdentifierActionCreatorPayload
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Custom;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a smart snippet suggestion, or related question, is collapsed.
   *
   * @param payload - The action creation payload.
   * @returns A dispatchable action.
   */
  logCollapseSmartSnippetSuggestion(
    payload:
      | QuestionAnsweringDocumentIdActionCreatorPayload
      | QuestionAnsweringUniqueIdentifierActionCreatorPayload
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Custom;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when no results is shown and the end users cancel last action.
   *
   * @param payload - The action creation payload.
   * @returns A dispatchable action.
   */
  logNoResultsBack(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a static filter value is selected.
   *
   * @param payload - The action creation payload.
   * @returns A dispatchable action.
   */
  logStaticFilterSelect(
    payload: LogStaticFilterToggleValueActionCreatorPayload
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a static filter value is deselected.
   *
   * @param payload - The action creation payload.
   * @returns A dispatchable action.
   */
  logStaticFilterDeselect(
    payload: LogStaticFilterToggleValueActionCreatorPayload
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when all selected values of a static filter are deselected.
   *
   * @param payload - The action creation payload.
   * @returns A dispatchable action.
   */
  logStaticFilterClearAll(
    payload: LogStaticFilterClearAllActionCreatorPayload
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a user action triggers a new query set in the effective query pipeline on the search page.
   *
   * @returns A dispatchable action.
   */
  logTriggerQuery(): AsyncThunkAction<
    {analyticsType: AnalyticsType.Search},
    void,
    AsyncThunkInsightAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a user undoes a query set in the effective query pipeline on the search page.
   *
   * @param payload - The action creation payload.
   * @returns A dispatchable action.
   */
  logUndoTriggerQuery(
    payload: LogUndoTriggerQueryActionCreatorPayload
  ): AsyncThunkAction<
    {analyticsType: AnalyticsType.Search},
    void,
    AsyncThunkInsightAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a user action triggers a notification set in the effective query pipeline on the search page.
   *
   * @returns A dispatchable action.
   */
  logNotifyTrigger(): AsyncThunkAction<
    {analyticsType: AnalyticsType.Search},
    void,
    AsyncThunkInsightAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a user action redirects them to a URL set in the effective query pipeline on the search page.
   *
   * @returns A dispatchable action.
   */
  logTriggerRedirect(): AsyncThunkAction<
    {analyticsType: AnalyticsType.Search},
    void,
    AsyncThunkInsightAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * The event to log when a user action executes a JavaScript function set in the effective query pipeline on the search page.
   *
   * @returns A dispatchable action.
   */
  logTriggerExecute(): AsyncThunkAction<
    {analyticsType: AnalyticsType.Search},
    void,
    AsyncThunkInsightAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;
}

/**
 * Returns possible search analytics action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
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
