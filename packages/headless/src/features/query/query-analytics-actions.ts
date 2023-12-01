import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../analytics/analytics-utils';

export const logSearchboxSubmit = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/searchbox/submit', (client) =>
    client.makeSearchboxSubmit()
  );
