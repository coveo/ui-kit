import {Qna} from '@coveo/relay-event-types';
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

//TODO: SFINT-5435
export const logRetryGeneratedAnswer = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/generatedAnswer/retry',
    (client, state) =>
      client.logRetryGeneratedAnswer(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );

//TODO: SFINT-5435
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
  makeInsightAnalyticsAction({
    prefix: 'analytics/generatedAnswer/openAnswerSource',
    __legacy__getBuilder: (client, state) => {
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
    },
    analyticsType: 'Qna.CitationItemClick',
    analyticsPayloadBuilder: (state): Qna.CitationItemClick => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      return {
        answer: {
          id: generativeQuestionAnsweringId!,
          type: 'CRGA',
        },
        citation: {
          id: citationId,
        },
      };
    },
  });

export const logHoverCitation = (
  citationId: string,
  citationHoverTimeInMs: number
): InsightAction =>
  makeInsightAnalyticsAction({
    prefix: 'analytics/generatedAnswer/hoverCitation',
    __legacy__getBuilder: (client, state) => {
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
          citationHoverTimeMs: citationHoverTimeInMs,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    },
    analyticsType: 'Qna.CitationHover',
    analyticsPayloadBuilder: (state): Qna.CitationHover => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      return {
        answer: {
          id: generativeQuestionAnsweringId!,
          type: 'CRGA',
        },
        citation: {
          id: citationId,
        },
        citationHoverTimeInMs,
      };
    },
  });

export const logLikeGeneratedAnswer = (): InsightAction =>
  makeInsightAnalyticsAction({
    prefix: 'analytics/generatedAnswer/like',
    __legacy__getBuilder: (client, state) => {
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
    },
    analyticsType: 'Qna.SubmitFeedback',
    analyticsPayloadBuilder: (state): Qna.SubmitFeedback => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      return {
        answer: {
          id: generativeQuestionAnsweringId!,
          type: 'CRGA',
        },
        feedback: {
          liked: true,
        },
      };
    },
  });

export const logDislikeGeneratedAnswer = (): InsightAction =>
  makeInsightAnalyticsAction({
    prefix: 'analytics/generatedAnswer/dislike',
    __legacy__getBuilder: (client, state) => {
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
    },
    analyticsType: 'Qna.SubmitFeedback',
    analyticsPayloadBuilder: (state): Qna.SubmitFeedback => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      return {
        answer: {
          id: generativeQuestionAnsweringId!,
          type: 'CRGA',
        },
        feedback: {
          liked: false,
        },
      };
    },
  });

export const logGeneratedAnswerFeedback = (
  feedback: GeneratedAnswerFeedback
): InsightAction =>
  makeInsightAnalyticsAction({
    prefix: 'analytics/generatedAnswer/sendFeedback',
    __legacy__getBuilder: (client, state) => {
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
    },
    analyticsType: 'Qna.SubmitFeedback',
    analyticsPayloadBuilder: (state): Qna.SubmitFeedback => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      return {
        answer: {
          id: generativeQuestionAnsweringId!,
          type: 'CRGA',
        },
        feedback: {
          liked: false,
          reason: feedback,
        },
      };
    },
  });

export const logGeneratedAnswerDetailedFeedback = (
  details: string
): InsightAction =>
  makeInsightAnalyticsAction({
    prefix: 'analytics/generatedAnswer/sendFeedback',
    __legacy__getBuilder: (client, state) => {
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
    },
    analyticsType: 'Qna.SubmitFeedback',
    analyticsPayloadBuilder: (state): Qna.SubmitFeedback => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      return {
        answer: {
          id: generativeQuestionAnsweringId!,
          type: 'CRGA',
        },
        feedback: {
          liked: false,
          reason: 'other',
          details,
        },
      };
    },
  });

//TODO: SFINT-5435
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
  makeInsightAnalyticsAction({
    prefix: 'analytics/generatedAnswer/show',
    __legacy__getBuilder: (client, state) => {
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
    },
    analyticsType: 'Qna.AnswerAction',
    analyticsPayloadBuilder: (state): Qna.AnswerAction => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      return {
        action: 'show',
        answer: {
          id: generativeQuestionAnsweringId!,
          type: 'CRGA',
        },
      };
    },
  });

export const logGeneratedAnswerHideAnswers = (): InsightAction =>
  makeInsightAnalyticsAction({
    prefix: 'analytics/generatedAnswer/hide',
    __legacy__getBuilder: (client, state) => {
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
    },
    analyticsType: 'Qna.AnswerAction',
    analyticsPayloadBuilder: (state): Qna.AnswerAction => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      return {
        action: 'hide',
        answer: {
          id: generativeQuestionAnsweringId!,
          type: 'CRGA',
        },
      };
    },
  });

export const logCopyGeneratedAnswer = (): InsightAction =>
  makeInsightAnalyticsAction({
    prefix: 'analytics/generatedAnswer/copy',
    __legacy__getBuilder: (client, state) => {
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
    },
    analyticsType: 'Qna.AnswerAction',
    analyticsPayloadBuilder: (state): Qna.AnswerAction => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      return {
        action: 'copyToClipboard',
        answer: {
          id: generativeQuestionAnsweringId!,
          type: 'CRGA',
        },
      };
    },
  });

export const generatedAnswerInsightAnalyticsClient = {
  logCopyGeneratedAnswer,
  logGeneratedAnswerHideAnswers,
  logGeneratedAnswerShowAnswers,
  logGeneratedAnswerStreamEnd,
  logGeneratedAnswerDetailedFeedback,
  logGeneratedAnswerFeedback,
  logDislikeGeneratedAnswer,
  logLikeGeneratedAnswer,
  logHoverCitation,
  logOpenGeneratedAnswerSource,
  logRetryGeneratedAnswer,
  logRephraseGeneratedAnswer,
};
