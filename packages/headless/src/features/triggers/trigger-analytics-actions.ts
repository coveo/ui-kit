import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

/**
 * Log trigger query
 */
export const logTriggerQuery = makeAnalyticsAction(
  'analytics/trigger/query',
  AnalyticsType.Search,
  (client, state) => {
    if (state.triggers && state.triggers.query !== null) {
      return client.logTriggerQuery();
    }
    return;
  }
);
