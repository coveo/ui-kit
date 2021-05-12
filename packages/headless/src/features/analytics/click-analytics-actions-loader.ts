import {AsyncThunkAction} from '@reduxjs/toolkit';
import {StateNeededByAnalyticsProvider} from '../../api/analytics/analytics';
import {Result} from '../../api/search/search/result';
import {Engine} from '../../app/headless-engine';
import {logDocumentOpen} from '../result/result-analytics-actions';
import {AnalyticsType, AsyncThunkAnalyticsOptions} from './analytics-utils';
import {logDocumentQuickview} from '../result-preview/result-preview-analytics-actions';

/**
 * The click analytics action creators.
 */
export interface ClickAnalyticsActionCreators {
  /**
   * The event to log when a result is selected.
   *
   * @param result - The selected result.
   * @returns A dispatchable action.
   */
  logDocumentOpen(
    result: Result
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Click;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
  >;

  /**
   * The event to log when a result is previewed.
   *
   * @param result - The previewed result.
   * @returns A dispatchable action.
   */
  logDocumentQuickview(
    result: Result
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Click;
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
  engine: Engine<object>
): ClickAnalyticsActionCreators {
  engine.addReducers({});

  return {
    logDocumentOpen,
    logDocumentQuickview,
  };
}
