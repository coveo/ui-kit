import {AsyncThunkAction} from '@reduxjs/toolkit';
import {InsightEngine} from '../../insight.index';
import {
  AnalyticsType,
  AsyncThunkInsightAnalyticsOptions,
} from '../analytics/analytics-utils';
import {logContextChanged} from './insight-search-analytics-actions';
import {StateNeededByInsightAnalyticsProvider} from '../../api/analytics/insight-analytics';

/**
 * The Insight Search analytics action creators.
 */
export interface InsightSearchAnalyticsActionCreators {
  /**
   * Creates a Case Assist event for when the user enters the interface.
   *
   * @returns A dispatchable action.
   */
  logContextChanged(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkInsightAnalyticsOptions<StateNeededByInsightAnalyticsProvider>
  >;
}

/**
 * Loads the insight search analytics actions.
 * @param engine The insight engine.
 * @returns The available analytics actions.
 */
export function loadInsightSearchAnalyticsActions(
  engine: InsightEngine
): InsightSearchAnalyticsActionCreators {
  engine.addReducers({});
  return {
    logContextChanged,
  };
}
