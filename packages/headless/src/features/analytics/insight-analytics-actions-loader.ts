import {InsightEngine, Result} from '../../insight.index';
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
import {SmartSnippetFeedback} from '../question-answering/question-answering-analytics-actions';
import {logCopyToClipboard} from '../result-actions/result-actions-insight-analytics-actions';
import {logResultsSort} from '../sort-criteria/sort-criteria-insight-analytics-actions';
import {
  LogStaticFilterToggleValueActionCreatorPayload,
  StaticFilterValueMetadata,
} from '../static-filter-set/static-filter-set-actions';
import {logInsightStaticFilterDeselect} from '../static-filter-set/static-filter-set-insight-analytics-actions';
import {AnalyticsType, InsightAction} from './analytics-utils';
import {
  logInsightInterfaceChange,
  logInsightInterfaceLoad,
} from './insight-analytics-actions';

export type {
  LogStaticFilterToggleValueActionCreatorPayload,
  LogCategoryFacetBreadcrumbActionCreatorPayload,
  LogNumericFacetBreadcrumbActionCreatorPayload,
  LogDateFacetBreadcrumbActionCreatorPayload,
  LogFacetBreadcrumbActionCreatorPayload,
  LogFacetUpdateSortActionCreatorPayload,
  LogFacetDeselectActionCreatorPayload,
  LogFacetSelectActionCreatorPayload,
  SmartSnippetFeedback,
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
  logClearBreadcrumbs(): InsightAction;

  /**
   * The event to log when a insight interface loads for the first time.
   *
   * @returns A dispatchable action.
   */
  logInterfaceLoad(): InsightAction;

  /**
   * The event to log when a tab is selected.
   *
   * @returns A dispatchable action.
   */
  logInterfaceChange(): InsightAction;

  /**
   * The event to log when a category facet breadcrumb is deselected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logCategoryFacetBreadcrumb(
    payload: LogCategoryFacetBreadcrumbActionCreatorPayload
  ): InsightAction;

  /**
   * The event to log when a facet breadcrumb is deselected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetBreadcrumb(
    payload: LogFacetBreadcrumbActionCreatorPayload
  ): InsightAction;

  /**
   * The event to log when all selected values in a facet are deselected.
   *
   * @param facetId - The facet id.
   * @returns A dispatchable action.
   */
  logFacetClearAll(facetId: string): InsightAction;

  /**
   * The event to log when a selected facet value is deselected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetDeselect(
    payload: LogFacetDeselectActionCreatorPayload
  ): InsightAction;

  /**
   * The event to log when an idle facet value is selected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetSelect(payload: LogFacetSelectActionCreatorPayload): InsightAction;

  /**
   * The event to log when shrinking a facet to show fewer values.
   *
   * @param facetId - The facet id.
   * @returns A dispatchable action.
   */
  logFacetShowLess(facetId: string): InsightAction;

  /**
   * The event to log when expanding a facet to show more values.
   *
   * @param facetId - The facet id.
   * @returns A dispatchable action.
   */
  logFacetShowMore(facetId: string): InsightAction;

  /**
   * The event to log when the facet sort criterion is changed.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logFacetUpdateSort(
    payload: LogFacetUpdateSortActionCreatorPayload
  ): InsightAction;

  /**
   * The event to log when a date facet breadcrumb is deselected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logDateFacetBreadcrumb(
    payload: LogDateFacetBreadcrumbActionCreatorPayload
  ): InsightAction;

  /**
   * The event to log when a numeric facet breadcrumb is deselected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logNumericFacetBreadcrumb(
    payload: LogNumericFacetBreadcrumbActionCreatorPayload
  ): InsightAction;

  /**
   * The event to log when navigating to the next page of results.
   *
   * @returns A dispatchable action.
   */
  logPageNext(): InsightAction;

  /**
   * The event to log when selecting a page in the pager.
   *
   * @returns A dispatchable action.
   */
  logPageNumber(): InsightAction;

  /**
   * The event to log when navigating to the previous page of results.
   *
   * @returns A dispatchable action.
   */
  logPagePrevious(): InsightAction;

  /**
   * The event to log when the results sort criterion is changed.
   *
   * @returns A dispatchable action.
   */
  logResultsSort(): InsightAction;

  /**
   * The event to log when a static filter value is deselected.
   *
   * @param payload - The action creation payload.
   * @returns A dispatchable action.
   */
  logStaticFilterDeselect(
    payload: LogStaticFilterToggleValueActionCreatorPayload
  ): InsightAction;

  /**
   * The event to log when the Copy To Clipboard result action is clicked.
   *
   * @param result - The result.
   * @returns A dispatchable action.
   */
  logCopyToClipboard(result: Result): InsightAction<AnalyticsType.Click>;
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
    logCopyToClipboard,
  };
}
