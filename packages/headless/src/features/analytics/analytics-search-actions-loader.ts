import {AsyncThunkAction} from '@reduxjs/toolkit';
import {StateNeededByAnalyticsProvider} from '../../api/analytics/analytics';
import {Engine} from '../../app/headless-engine';
import {logClearBreadcrumbs} from '../facets/generic/facet-generic-analytics-actions';
import {AnalyticsType, AsyncThunkAnalyticsOptions} from './analytics-utils';
// import {
//   logFacetBreadcrumb,
//   logFacetClearAll,
//   logFacetDeselect,
//   logFacetSearch,
//   logFacetSelect,
//   logFacetShowLess,
//   logFacetShowMore,
//   logFacetUpdateSort,
// } from '../facets/facet-set/facet-set-analytics-actions'

export interface AnalyticsSearchActionCreators {
  logClearBreadcrumbs(): AsyncThunkAction<
    {analyticsType: AnalyticsType.Search},
    void,
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
  >;
}

/**
 * Returns possible analytics search action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadSearchHubActions(
  engine: Engine<object>
): AnalyticsSearchActionCreators {
  engine.addReducers({});

  return {
    logClearBreadcrumbs,
  };
}
