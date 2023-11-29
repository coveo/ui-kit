import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';
import {InsightAction, makeInsightAnalyticsAction} from './analytics-utils';

export interface CreateArticleMetadata {
  articleType: string;
  triggeredBy: string;
}

export const logInsightInterfaceLoad = (): InsightAction =>
  makeInsightAnalyticsAction('analytics/interface/load', (client, state) =>
    client.logInterfaceLoad(
      getCaseContextAnalyticsMetadata(state.insightCaseContext)
    )
  );

export const logInsightInterfaceChange = (): InsightAction =>
  makeInsightAnalyticsAction('analytics/interface/change', (client, state) => {
    client.logInterfaceChange({
      ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      interfaceChangeTo: state.configuration.analytics.originLevel2,
    });
  });

export const logInsightCreateArticle = (
  createArticleMetadata: CreateArticleMetadata
): InsightAction =>
  makeInsightAnalyticsAction('analytics/createArticle', (client, state) => {
    return client.logCreateArticle(
      createArticleMetadata,
      getCaseContextAnalyticsMetadata(state.insightCaseContext)
    );
  });
