import {
  InsightAction,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export const logSearchboxSubmit = (): InsightAction =>
  makeInsightAnalyticsAction('analytics/searchbox/submit', (client, state) =>
    client.logSearchboxSubmit(
      getCaseContextAnalyticsMetadata(state.insightCaseContext)
    )
  );
