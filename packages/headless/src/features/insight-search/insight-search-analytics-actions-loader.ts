import {AsyncThunkAction} from '@reduxjs/toolkit';
import {StateNeededByInsightAnalyticsProvider} from '../../api/analytics/insight-analytics';
import {InsightEngine, Result} from '../../insight.index';
import {
  AnalyticsType,
  AsyncThunkInsightAnalyticsOptions,
} from '../analytics/analytics-utils';
import {
  logContextChanged,
  logExpandToFullUI,
  logCopyToClipboard,
} from './insight-search-analytics-actions';

/**
 * The Insight Search analytics action creators.
 */
export interface InsightSearchAnalyticsActionCreators {
  /**
   * The event to log when the context is updated.
   *
   * @param caseId - The case ID.
   * @param caseNumber - The case number.
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
   * @param caseId - The case ID.
   * @param caseNumber - The case number.
   * @param fullSearchComponentName - The name of the full search component to open.
   * @param triggeredBy - The action that triggered the event.
   * @returns A dispatchable action.
   */
  logCopyToClipboard(result: Result): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Click;
    },
    void,
    AsyncThunkInsightAnalyticsOptions<StateNeededByInsightAnalyticsProvider>
  >;

  /**
   * The event to log when the full search page is opened.
   *
   * @param caseId - The case ID.
   * @param caseNumber - The case number.
   * @param fullSearchComponentName - The name of the full search component to open.
   * @param triggeredBy - The action that triggered the event.
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
    logCopyToClipboard,
  };
}
