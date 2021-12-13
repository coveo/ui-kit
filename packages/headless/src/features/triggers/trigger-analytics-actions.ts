import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

export const logTriggerQuery = makeAnalyticsAction(
  'analytics/trigger/query',
  AnalyticsType.Search,
  (client, state) => {
    if (state.triggers?.query) {
      return client.logTriggerQuery();
    }
    return;
  }
);

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

/**
 * Log trigger execute
 */
export const logTriggerExecute = makeAnalyticsAction(
  'analytics/trigger/execute',
  AnalyticsType.Search,
  (client, state) => {
    if (state.triggers?.execute) {
      return client.logTriggerExecute({
        executed: state.triggers.execute.functionName,
      });
    }
    return;
  }
);
