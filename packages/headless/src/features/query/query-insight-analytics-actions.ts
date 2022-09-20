import {
  AnalyticsType,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export const logSearchboxSubmit = makeInsightAnalyticsAction(
  'analytics/searchbox/submit',
  AnalyticsType.Search,
  (client, state) =>
    client.logSearchboxSubmit(
      getCaseContextAnalyticsMetadata(state.insightCaseContext)
    )
);
