import {CreateArticleMetadata} from 'coveo.analytics';
import {
  InsightAction,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export const logCreateArticle = (
  createArticleMetadata: CreateArticleMetadata
): InsightAction =>
  makeInsightAnalyticsAction('analytics/createArticle', (client, state) => {
    return client.logCreateArticle(
      createArticleMetadata,
      getCaseContextAnalyticsMetadata(state.insightCaseContext)
    );
  });
