import {AsyncThunkAction} from '@reduxjs/toolkit';
import {InsightEngine} from '../../insight.index';
import {
  AnalyticsType,
  AsyncThunkInsightAnalyticsOptions,
} from '../analytics/analytics-utils';
import {
  logContextChanged,
  logExpandToFullUI,
} from './insight-search-analytics-actions';
import {StateNeededByInsightAnalyticsProvider} from '../../api/analytics/insight-analytics';

/**
 * The Insight Search analytics action creators.
 */
export interface InsightSearchAnalyticsActionCreators {
  /**
   * The event to log when the context is updated.
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

  /**
   * The event to log when the full search page is opened.
   *
   * @returns A dispatchable action.
   */
  logExpandToFullUI(
    caseId: string,
    caseNumber: string,
    fullSearchComponentName: string,
    triggeredBy: string
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Custom;
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
    logExpandToFullUI,
  };
}
