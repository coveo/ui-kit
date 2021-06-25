import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';
import {TriggerNotifyMetadata} from '../../../node_modules/coveo.analytics/dist/definitions/searchPage/searchPageEvents';

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
      const meta: TriggerNotifyMetadata = {
        notification: state.triggers.notify,
      };
      return client.logTriggerNotify(meta);
    }
    return;
  }
);
