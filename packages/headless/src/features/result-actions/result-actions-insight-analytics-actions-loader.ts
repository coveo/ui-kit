import {AsyncThunkAction} from '@reduxjs/toolkit';
import {StateNeededByInsightAnalyticsProvider} from '../../api/analytics/insight-analytics';
import {InsightEngine, Result} from '../../insight.index';
import {
  AnalyticsType,
  AsyncThunkInsightAnalyticsOptions,
} from '../analytics/analytics-utils';
import {logCopyToClipboard} from './result-actions-insight-analytics-actions';

/**
 * The Insight Result Actions analytics action creators.
 */
export interface InsighResultActionsAnalyticsActionsCreators {
  /**
   * The event to log when the Copy To Clipboard result action is clicked.
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
 * Loads the insight result actions analytics actions.
 * @param engine The insight engine.
 * @returns The available analytics actions.
 */
export function loadResultActionsAnalyticsActions(
  engine: InsightEngine
): InsighResultActionsAnalyticsActionsCreators {
  engine.addReducers({});
  return {
    logCopyToClipboard,
  };
}
