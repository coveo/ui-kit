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
    if (state.triggers?.notify) {
      return client.logTriggerNotify({
        notification: state.triggers.notify,
      });
    }
    return;
  }
);
