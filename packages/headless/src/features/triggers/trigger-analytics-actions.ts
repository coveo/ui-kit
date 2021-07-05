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

/**
 * Log trigger execute
 */
export const logTriggerExecute = makeAnalyticsAction(
  'analytics/trigger/execute',
  AnalyticsType.Search,
  (client, state) => {
    if (state.triggers?.execute) {
      return client.logTriggerExecute({
        executed:
          'name: ' +
          state.triggers.execute.name +
          ' params: ' +
          state.triggers.execute.params,
      });
    }
    return;
  }
);
