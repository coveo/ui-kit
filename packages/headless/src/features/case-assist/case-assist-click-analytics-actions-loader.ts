import {AsyncThunkAction} from '@reduxjs/toolkit';
import {StateNeededByAnalyticsProvider} from '../../api/analytics/analytics';
import {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine';
import {
  AnalyticsType,
  AsyncThunkAnalyticsOptions,
} from '../analytics/analytics-utils';
import {logCaseStart} from './case-assist-analytics-actions';

/**
 * The click analytics action creators.
 */
export interface ClickAnalyticsActionCreators {
  /**
   * The event to log when a case creation starts
   *
   * @returns A dispatchable action.
   */
  logCaseStart(): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.CaseAssist;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
  >;
}

/**
 * Returns possible click analytics action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadClickAnalyticsActions(
  engine: CaseAssistEngine
): ClickAnalyticsActionCreators {
  engine.addReducers({});

  return {
    logCaseStart,
  };
}
