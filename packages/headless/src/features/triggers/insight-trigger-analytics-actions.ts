import {
  type InsightAction,
  makeInsightAnalyticsActionFactory,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';

export const logNotifyTrigger = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.triggerQuery)(
    'analytics/trigger/notify',
    (client, state) => {
      if (!state.triggers?.notifications.length) {
        return null;
      }
      return client.logTriggerNotify(
        {
          notifications: state.triggers.notifications,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );
