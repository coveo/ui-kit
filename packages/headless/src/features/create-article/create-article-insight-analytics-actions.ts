import {
  InsightAction,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export const logCreateArticle = (
  articleType: string,
  triggeredBy: string
): InsightAction =>
  makeInsightAnalyticsAction('analytics/createArticle', (client, state) => {
    const articleMetadata = {
      articleType,
      triggeredBy,
    };
    return client.logCreateArticle(
      articleMetadata,
      getCaseContextAnalyticsMetadata(state.insightCaseContext)
    );
  });
