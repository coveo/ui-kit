import {InsightPanel} from '@coveo/relay-event-types';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload';
import {
  InsightAction,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export interface CreateArticleMetadata {
  articleType: string;
}

export const logExpandToFullUI = (
  _caseId: string,
  _caseNumber: string,
  fullSearchComponentName: string,
  triggeredBy: string
): InsightAction =>
  makeInsightAnalyticsAction({
    prefix: 'analytics/expandToFullUI',
    __legacy__getBuilder: (client, state) => {
      const metadata = getCaseContextAnalyticsMetadata(
        state.insightCaseContext
      );
      const meta = {
        caseId: metadata.caseId,
        caseNumber: metadata.caseNumber,
        fullSearchComponentName,
        triggeredBy,
        caseContext: metadata.caseContext,
      };
      return client.logExpandToFullUI(meta);
    },
    analyticsType: 'InsightPanel.ExpandToFullUI',
    analyticsPayloadBuilder: (state): InsightPanel.ExpandToFullUI => {
      const metadata = getCaseContextAnalyticsMetadata(
        state.insightCaseContext
      );
      return {
        context: {
          targetId: metadata.caseId,
          targetType: 'Case',
          caseNumber: metadata.caseNumber,
        } as InsightPanel.Context,
      };
    },
  });

export const logInsightCreateArticle = (
  createArticleMetadata: CreateArticleMetadata
): InsightAction =>
  makeInsightAnalyticsAction({
    prefix: 'analytics/insight/createArticle',
    __legacy__getBuilder: (client, state) => {
      validatePayload(createArticleMetadata, {
        articleType: requiredNonEmptyString,
      });
      return client.logCreateArticle(
        createArticleMetadata,
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    },
    analyticsType: 'InsightPanel.CreateArticle',
    analyticsPayloadBuilder: (state): InsightPanel.CreateArticle => {
      const metadata = getCaseContextAnalyticsMetadata(
        state.insightCaseContext
      );
      return {
        articleType: createArticleMetadata.articleType,
        context: {
          targetId: metadata.caseId,
          targetType: 'Case',
          caseNumber: metadata.caseNumber,
        } as InsightPanel.Context,
      };
    },
  });
