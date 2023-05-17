import {AnalyticsType, SearchAction} from '../analytics/analytics-utils';
import {makeAnalyticsAction} from '../analytics/search-analytics-utils';

export const logSearchboxSubmit = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/searchbox/submit',
    AnalyticsType.Search,
    (client) => client.makeSearchboxSubmit()
  );
