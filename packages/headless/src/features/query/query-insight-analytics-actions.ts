import {AnalyticsType} from '../analytics/analytics-utils';
import {
  InsightAction,
  makeInsightAnalyticsAction,
} from '../analytics/insight-analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export const logSearchboxSubmit = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/searchbox/submit',
    AnalyticsType.Search,
    (client, state) =>
      client.logSearchboxSubmit(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );
