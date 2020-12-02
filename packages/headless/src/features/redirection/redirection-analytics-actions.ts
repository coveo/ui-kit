import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

/**
 * Log trigger redirection
 */
export const logTriggerRedirect = makeAnalyticsAction(
  'analytics/trigger/redirection',
  AnalyticsType.Search,
  (client, state) => {
    if (state.redirection && state.redirection.redirectTo !== null) {
      return client.logTriggerRedirect({
        redirectedTo: state.redirection.redirectTo,
      });
    }
    return;
  }
);
