import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

/**
 * Log trigger query
 */
export const logQueryTrigger = makeAnalyticsAction(
  'analytics/trigger/query',
  AnalyticsType.Search,
  (client, state) => {
    if (state.triggers?.query) {
      return client.logTriggerQuery();
    }
    return;
  }
);

/**
 * Log trigger notify
 */
export const logNotifyTrigger = makeAnalyticsAction(
  'analytics/trigger/notify',
  AnalyticsType.Search,
  (client, state) => {
    if (state.triggers?.notification) {
      return client.logTriggerNotify({
        notification: state.triggers.notification,
      });
    }
    return;
  }
);

/**
 * Log trigger redirection
 */
export const logTriggerRedirect = makeAnalyticsAction(
  'analytics/trigger/redirect',
  AnalyticsType.Search,
  (client, state) => {
    if (state.triggers?.redirectTo) {
      return client.logTriggerRedirect({
        redirectedTo: state.triggers.redirectTo,
      });
    }
    return;
  }
);
