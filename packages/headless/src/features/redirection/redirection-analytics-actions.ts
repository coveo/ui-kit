import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

/**
 * Log redirection
 */
export const logRedirection = makeAnalyticsAction(
  'analytics/redirection',
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
