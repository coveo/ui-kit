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
