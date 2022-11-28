import {AsyncThunkAction} from '@reduxjs/toolkit';
import {StateNeededBySearchAnalyticsProvider} from '../../api/analytics/search-analytics';
import {Result} from '../../api/search/search/result';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  AnalyticsType,
  AsyncThunkAnalyticsOptions,
} from '../analytics/analytics-utils';
import {logCopyToClipboard} from './result-actions-analytics-actions';

/**
 * The Result Actions analytics action creators.
 */
export interface ResultActionsAnalyticsActionsCreators {
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
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;
}

/**
 * Loads the result actions analytics actions.
 * @param engine The search engine.
 * @returns The available analytics actions.
 */
export function ResultActionsAnalyticsActions(
  engine: SearchEngine
): ResultActionsAnalyticsActionsCreators {
  engine.addReducers({});
  return {
    logCopyToClipboard,
  };
}
