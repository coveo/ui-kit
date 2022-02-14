import {temp__makeAnalyticsAction} from '../analytics/analytics-actions';
import {AnalyticsType} from '../analytics/analytics-utils';

export const logSearchboxSubmit = temp__makeAnalyticsAction(
  'analytics/searchbox/submit',
  AnalyticsType.Search,
  (client) => client.makeLogSearchboxSubmit()
);
