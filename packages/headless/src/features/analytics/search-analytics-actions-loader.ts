import {AsyncThunkAction} from '@reduxjs/toolkit';
import {StateNeededByAnalyticsProvider} from '../../api/analytics/analytics';
import {Engine} from '../../app/headless-engine';
import {logClearBreadcrumbs} from '../facets/generic/facet-generic-analytics-actions';
import {logInterfaceChange, logInterfaceLoad} from './analytics-actions';
import {AnalyticsType, AsyncThunkAnalyticsOptions} from './analytics-utils';
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
} from '../history/history-analytics-actions';
import {
  logPageNext,
  logPageNumber,
  logPagePrevious,
  logPagerResize,
} from '../pagination/pagination-analytics-actions';
import {logSearchboxSubmit} from '../query/query-analytics-actions';
import {
  logQuerySuggestionClick,
  LogQuerySuggestionClickActionCreatorPayload,
} from '../query-suggest/query-suggest-analytics-actions';
import {logResultsSort} from '../sort-criteria/sort-criteria-analytics-actions';
import {
  logCollapseSmartSnippet,
  logExpandSmartSnippet,
  logDislikeSmartSnippet,
  logLikeSmartSnippet,
  logCollapseSmartSnippetSuggestion,
  logExpandSmartSnippetSuggestion,
} from '../question-answering/question-answering-analytics-actions';
import {QuestionAnsweringDocumentIdActionCreatorPayload} from '../question-answering/question-answering-document-id';

export {
  LogCategoryFacetBreadcrumbActionCreatorPayload,
  LogFacetBreadcrumbActionCreatorPayload,
  LogFacetDeselectActionCreatorPayload,
  LogFacetSelectActionCreatorPayload,
  LogFacetUpdateSortActionCreatorPayload,
  LogDateFacetBreadcrumbActionCreatorPayload,
  LogNumericFacetBreadcrumbActionCreatorPayload,
  LogQuerySuggestionClickActionCreatorPayload,
  QuestionAnsweringDocumentIdActionCreatorPayload,
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
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
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
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
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
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
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
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
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
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
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
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
  >;

  /**
   * The event to log when all selected values in a facet are deselected.
   *
   * @param facetId - The facet id.
   * @returns A dispatchable action.
   */
  logFacetClearAll(
    facetId: string
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
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
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
  >;

  /**
   * The event to log when an idle facet value is selected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetSelect(
    payload: LogFacetSelectActionCreatorPayload
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
  >;

  /**
   * The event to log when shrinking a facet to show fewer values.
   *
   * @param facetId - The facet id.
   * @returns A dispatchable action.
   */
  logFacetShowLess(
    facetId: string
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
  >;

  /**
   * The event to log when expanding a facet to show more values.
   *
   * @param facetId - The facet id.
   * @returns A dispatchable action.
   */
  logFacetShowMore(
    facetId: string
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
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
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
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
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
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
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
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
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
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
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
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
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
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
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
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
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
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
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
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
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
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
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
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
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
  >;

  /**
   * The event to log when a smart snipped is collapsed.
   *
   * @returns A dispatchable action.
   */
  logCollapseSmartSnippet(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Custom;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
  >;

  /**
   * The event to log when a smart snipped is expanded.
   *
   * @returns A dispatchable action.
   */
  logExpandSmartSnippet(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Custom;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
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
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
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
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
  >;

  /**
   * The event to log when a query suggestion is selected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logExpandSmartSnippetSuggestion(
    payload: QuestionAnsweringDocumentIdActionCreatorPayload
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Custom;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
  >;

  /**
   * The event to log when a smart snippet suggestion, or related question, is collapsed.
   *
   * @param payload - The action creation payload.
   * @returns A dispatchable action.
   */
  logCollapseSmartSnippetSuggestion(
    payload: QuestionAnsweringDocumentIdActionCreatorPayload
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Custom;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
  >;
}

/**
 * Returns possible search analytics action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadSearchAnalyticsActions(
  engine: Engine<object>
): SearchAnalyticsActionCreators {
  engine.addReducers({});

  return {
    logClearBreadcrumbs,
    logInterfaceLoad,
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
    logExpandSmartSnippet,
    logCollapseSmartSnippet,
    logExpandSmartSnippetSuggestion,
    logCollapseSmartSnippetSuggestion,
  };
}
