import {AsyncThunkAction} from '@reduxjs/toolkit';
import {StateNeededByInsightAnalyticsProvider} from '../../api/analytics/insight-analytics';
import {InsightEngine, Result} from '../../insight.index';
import {
  AnalyticsType,
  AsyncThunkInsightAnalyticsOptions,
} from '../analytics/analytics-utils';
import {logCopyToClipboard} from './result-actions-insight-analytics-actions';

/**
 * The Insight Search analytics action creators.
 */
export interface ResultActionsAnalyticsActionCreators {
  /**
   * The event to log when the full search page is opened.
   *
   * @param result - The result.
   * @returns A dispatchable action.
   */
  logCopyToClipboard(result: Result): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Click;
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
export function loadInsighResultActionAnalyticsActions(
  engine: InsightEngine
): ResultActionsAnalyticsActionCreators {
  engine.addReducers({});
  return {
    logCopyToClipboard,
  };
}
