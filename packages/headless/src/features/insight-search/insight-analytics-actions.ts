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
  caseId: string,
  caseNumber: string,
  fullSearchComponentName: string,
  triggeredBy: string
): InsightAction =>
  makeInsightAnalyticsAction({
    prefix: 'analytics/expandToFullUI',
    __legacy__getBuilder: (client, state) => {
      const meta = {
        caseId,
        caseNumber,
        fullSearchComponentName,
        triggeredBy,
        caseContext: state.insightCaseContext?.caseContext || {},
      };
      return client.logExpandToFullUI(meta);
    },
    analyticsType: 'ExpandToFullUI',
    analyticsPayloadBuilder: (_state): InsightPanel.ExpandToFullUI => {
      return {
        context: {
          targetId: caseId,
          targetType: 'Case',
          caseNumber: caseNumber,
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
    analyticsType: 'CreateArticle',
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
