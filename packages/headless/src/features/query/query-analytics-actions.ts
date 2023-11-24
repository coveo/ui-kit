import {makeAnalyticsAction, SearchAction} from '../analytics/analytics-utils';

//TODO: KIT-2859
export const logSearchboxSubmit = (): SearchAction =>
  makeAnalyticsAction('analytics/searchbox/submit', (client) =>
    client.makeSearchboxSubmit()
  );
