import type {InsightPanel} from '@coveo/relay-event-types';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload.js';
import {
  type InsightAction,
  makeInsightAnalyticsActionFactory,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';

export interface CreateArticleMetadata {
  articleType: string;
}

export const logExpandToFullUI = (
  fullSearchComponentName: string,
  triggeredBy: string
): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.expandToFullUI)({
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
  makeInsightAnalyticsActionFactory(SearchPageEvents.createArticle)({
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

export const logOpenUserActions = (): InsightAction =>
  makeInsightAnalyticsActionFactory('openUserActions')({
    prefix: 'analytics/insight/openUserActions',
    __legacy__getBuilder: (client, state) => {
      return client.logOpenUserActions(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    },
  });
