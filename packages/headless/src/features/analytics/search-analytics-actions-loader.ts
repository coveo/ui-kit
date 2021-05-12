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
  logFacetSearch,
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

export {
  LogCategoryFacetBreadcrumbActionCreatorPayload,
  LogFacetDeselectActionCreatorPayload,
  LogFacetSelectActionCreatorPayload,
  LogFacetUpdateSortActionCreatorPayload,
  LogDateFacetBreadcrumbActionCreatorPayload,
  LogNumericFacetBreadcrumbActionCreatorPayload,
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
   * The event to log when searching through facet values.
   *
   * @param facetId - The facet id.
   * @returns A dispatchable action.
   */
  logFacetSearch(
    facetId: string
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
    logFacetSearch,
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
  };
}
