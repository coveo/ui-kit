import {
  AnalyticsType,
  InsightAction,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';

export const logSearchboxSubmit = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/searchbox/submit',
    AnalyticsType.Search,
    (client, state) =>
      client.logSearchboxSubmit(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );
