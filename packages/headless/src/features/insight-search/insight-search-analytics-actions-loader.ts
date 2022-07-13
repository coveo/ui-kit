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
   * Creates an Insight event for when the case context changes.
   *
   * @returns A dispatchable action.
   */
  logContextChanged(
    caseId: string,
    caseNumber: string
  ): AsyncThunkAction<
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
