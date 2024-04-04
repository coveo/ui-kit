import {
  InsightAction,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';
import {
  citationSourceSelector,
  generativeQuestionAnsweringIdSelector,
} from './generated-answer-selectors';
import {GeneratedResponseFormat} from './generated-response-format';

export type GeneratedAnswerFeedback =
  | 'irrelevant'
  | 'notAccurate'
  | 'outOfDate'
  | 'harmful';

export const logRetryGeneratedAnswer = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/generatedAnswer/retry',
    (client, state) =>
      client.logRetryGeneratedAnswer(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );

export const logRephraseGeneratedAnswer = (
  responseFormat: GeneratedResponseFormat
): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/generatedAnswer/rephrase',
    (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.logRephraseGeneratedAnswer(
        {
          generativeQuestionAnsweringId,
          rephraseFormat: responseFormat.answerStyle,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );

export const logOpenGeneratedAnswerSource = (
  citationId: string
): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/generatedAnswer/openAnswerSource',
    (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      const citation = citationSourceSelector(state, citationId);
      if (!generativeQuestionAnsweringId || !citation) {
        return null;
      }
      return client.logOpenGeneratedAnswerSource(
        {
          generativeQuestionAnsweringId,
          permanentId: citation.permanentid,
          citationId: citation.id,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );

export const logHoverCitation = (
  citationId: string,
  citationHoverTimeMs: number
): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/generatedAnswer/hoverCitation',
    (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      const citation = citationSourceSelector(state, citationId);
      if (!generativeQuestionAnsweringId || !citation) {
        return null;
      }
      return client.logGeneratedAnswerSourceHover(
        {
          generativeQuestionAnsweringId,
          permanentId: citation.permanentid,
          citationId: citation.id,
          citationHoverTimeMs,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );

export const logLikeGeneratedAnswer = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/generatedAnswer/like',
    (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.logLikeGeneratedAnswer(
        {
          generativeQuestionAnsweringId,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );

export const logDislikeGeneratedAnswer = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/generatedAnswer/dislike',
    (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.logDislikeGeneratedAnswer(
        {
          generativeQuestionAnsweringId,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );

export const logGeneratedAnswerFeedback = (
  feedback: GeneratedAnswerFeedback
): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/generatedAnswer/sendFeedback',
    (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.logGeneratedAnswerFeedbackSubmit(
        {
          generativeQuestionAnsweringId,
          reason: feedback,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );

export const logGeneratedAnswerDetailedFeedback = (
  details: string
): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/generatedAnswer/sendFeedback',
    (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.logGeneratedAnswerFeedbackSubmit(
        {
          generativeQuestionAnsweringId,
          reason: 'other',
          details,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );

export const logGeneratedAnswerStreamEnd = (
  answerGenerated: boolean
): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/generatedAnswer/streamEnd',
    (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.logGeneratedAnswerStreamEnd(
        {
          generativeQuestionAnsweringId,
          answerGenerated,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );

export const logGeneratedAnswerShowAnswers = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/generatedAnswer/show',
    (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.logGeneratedAnswerShowAnswers(
        {
          generativeQuestionAnsweringId,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );

export const logGeneratedAnswerHideAnswers = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/generatedAnswer/hide',
    (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.logGeneratedAnswerHideAnswers(
        {
          generativeQuestionAnsweringId,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );

export const logCopyGeneratedAnswer = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/generatedAnswer/copy',
    (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.logGeneratedAnswerCopyToClipboard(
        {
          generativeQuestionAnsweringId,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );
