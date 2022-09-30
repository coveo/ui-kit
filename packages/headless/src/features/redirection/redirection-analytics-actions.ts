import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

export const logRedirection = makeAnalyticsAction(
  'analytics/redirection',
  AnalyticsType.Search,
  (client, state) => {
    if (state.redirection?.redirectTo) {
      return client.makeTriggerRedirect({
        redirectedTo: state.redirection.redirectTo,
      });
    }
    return null;
  }
);
