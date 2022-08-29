import {AsyncThunkAction} from '@reduxjs/toolkit';
import {StateNeededByInsightAnalyticsProvider} from '../../api/analytics/insight-analytics';
import {InsightEngine} from '../../insight.index';
import {LogCategoryFacetBreadcrumbActionCreatorPayload} from '../facets/category-facet-set/category-facet-set-analytics-actions';
import {logCategoryFacetBreadcrumb} from '../facets/category-facet-set/category-facet-set-insight-analytics-actions';
import {
  LogFacetBreadcrumbActionCreatorPayload,
  LogFacetDeselectActionCreatorPayload,
  LogFacetSelectActionCreatorPayload,
} from '../facets/facet-set/facet-set-analytics-actions';
import {
  logFacetBreadcrumb,
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
  logFacetShowLess,
  logFacetShowMore,
  logFacetUpdateSort,
  LogFacetUpdateSortActionCreatorPayload,
} from '../facets/facet-set/facet-set-insight-analytics-actions';
import {logClearBreadcrumbs} from '../facets/generic/facet-generic-insight-analytics-actions';
import {LogDateFacetBreadcrumbActionCreatorPayload} from '../facets/range-facets/date-facet-set/date-facet-analytics-actions';
import {logDateFacetBreadcrumb} from '../facets/range-facets/date-facet-set/date-facet-insight-analytics-actions';
import {LogNumericFacetBreadcrumbActionCreatorPayload} from '../facets/range-facets/numeric-facet-set/numeric-facet-analytics-actions';
import {logNumericFacetBreadcrumb} from '../facets/range-facets/numeric-facet-set/numeric-facet-insight-analytics-actions';
import {
  logPageNext,
  logPageNumber,
  logPagePrevious,
} from '../pagination/pagination-insight-analytics-actions';
import {logResultsSort} from '../sort-criteria/sort-criteria-insight-analytics-actions';
import {
  logInsightStaticFilterDeselect,
  LogStaticFilterToggleValueActionCreatorPayload,
  StaticFilterValueMetadata,
} from '../static-filter-set/static-filter-set-actions';
import {
  logInsightInterfaceChange,
  logInsightInterfaceLoad,
} from './analytics-actions';
import {
  AnalyticsType,
  AsyncThunkInsightAnalyticsOptions,
} from './analytics-utils';

export type {
  LogStaticFilterToggleValueActionCreatorPayload,
  LogCategoryFacetBreadcrumbActionCreatorPayload,
  LogNumericFacetBreadcrumbActionCreatorPayload,
  LogDateFacetBreadcrumbActionCreatorPayload,
  LogFacetBreadcrumbActionCreatorPayload,
  LogFacetUpdateSortActionCreatorPayload,
  LogFacetDeselectActionCreatorPayload,
  LogFacetSelectActionCreatorPayload,
  StaticFilterValueMetadata,
};

/**
 * The insight analytics action creators.
 */
export interface InsightAnalyticsActionCreators {
  /**
   * The event to log when clearing breadcrumbs.
   *
   * @returns A dispatchable action.
   */
  logClearBreadcrumbs(): AsyncThunkAction<
    {analyticsType: AnalyticsType.Search},
    void,
    AsyncThunkInsightAnalyticsOptions<StateNeededByInsightAnalyticsProvider>
  >;

  /**
   * The event to log when a insight interface loads for the first time.
   *
   * @returns A dispatchable action.
   */
  logInterfaceLoad(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkInsightAnalyticsOptions<StateNeededByInsightAnalyticsProvider>
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
    AsyncThunkInsightAnalyticsOptions<StateNeededByInsightAnalyticsProvider>
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
    AsyncThunkInsightAnalyticsOptions<StateNeededByInsightAnalyticsProvider>
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
    AsyncThunkInsightAnalyticsOptions<StateNeededByInsightAnalyticsProvider>
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
    AsyncThunkInsightAnalyticsOptions<StateNeededByInsightAnalyticsProvider>
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
    AsyncThunkInsightAnalyticsOptions<StateNeededByInsightAnalyticsProvider>
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
    AsyncThunkInsightAnalyticsOptions<StateNeededByInsightAnalyticsProvider>
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
    AsyncThunkInsightAnalyticsOptions<StateNeededByInsightAnalyticsProvider>
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
    AsyncThunkInsightAnalyticsOptions<StateNeededByInsightAnalyticsProvider>
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
    AsyncThunkInsightAnalyticsOptions<StateNeededByInsightAnalyticsProvider>
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
    AsyncThunkInsightAnalyticsOptions<StateNeededByInsightAnalyticsProvider>
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
    AsyncThunkInsightAnalyticsOptions<StateNeededByInsightAnalyticsProvider>
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
    AsyncThunkInsightAnalyticsOptions<StateNeededByInsightAnalyticsProvider>
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
    AsyncThunkInsightAnalyticsOptions<StateNeededByInsightAnalyticsProvider>
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
    AsyncThunkInsightAnalyticsOptions<StateNeededByInsightAnalyticsProvider>
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
    AsyncThunkInsightAnalyticsOptions<StateNeededByInsightAnalyticsProvider>
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
    AsyncThunkInsightAnalyticsOptions<StateNeededByInsightAnalyticsProvider>
  >;
}

/**
 * Returns possible insight analytics action creators.
 *
 * @param engine - The insight engine.
 * @returns An object holding the action creators.
 */
export function loadInsightAnalyticsActions(
  engine: InsightEngine
): InsightAnalyticsActionCreators {
  engine.addReducers({});

  return {
    logClearBreadcrumbs,
    logInterfaceLoad: logInsightInterfaceLoad,
    logInterfaceChange: logInsightInterfaceChange,
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
    logPageNext,
    logPageNumber,
    logPagePrevious,
    logResultsSort,
    logStaticFilterDeselect: logInsightStaticFilterDeselect,
  };
}
