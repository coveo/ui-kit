import {
  InsightAction,
  makeInsightAnalyticsActionFactory,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

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
