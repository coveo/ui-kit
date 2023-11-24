import {makeAnalyticsAction, SearchAction} from '../analytics/analytics-utils';

export const logSearchboxSubmit = (): SearchAction =>
  makeAnalyticsAction('analytics/searchbox/submit', (client) =>
    client.makeSearchboxSubmit()
  );
