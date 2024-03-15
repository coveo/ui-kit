import {Qna} from '@coveo/relay-event-types';
import {GeneratedAnswerStreamEndMeta} from 'coveo.analytics';
import {
  CustomAction,
  LegacySearchAction,
  makeAnalyticsAction,
} from '../analytics/analytics-utils';
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

//TODO: KIT-2859
export const logRetryGeneratedAnswer = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/generatedAnswer/retry', (client) =>
    client.makeRetryGeneratedAnswer()
  );

//TODO: KIT-2859
export const logRephraseGeneratedAnswer = (
  responseFormat: GeneratedResponseFormat
): LegacySearchAction =>
  makeAnalyticsAction('analytics/generatedAnswer/rephrase', (client, state) => {
    const generativeQuestionAnsweringId =
      generativeQuestionAnsweringIdSelector(state);
    if (!generativeQuestionAnsweringId) {
      return null;
    }
    return client.makeRephraseGeneratedAnswer({
      generativeQuestionAnsweringId,
      rephraseFormat: responseFormat.answerStyle,
    });
  });

export const logOpenGeneratedAnswerSource = (
  citationId: string
): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/openAnswerSource',
    __legacy__getBuilder: (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      const citation = citationSourceSelector(state, citationId);
      if (!generativeQuestionAnsweringId || !citation) {
        return null;
      }
      return client.makeOpenGeneratedAnswerSource({
        generativeQuestionAnsweringId,
        permanentId: citation.permanentid,
        citationId: citation.id,
      });
    },
    analyticsType: 'Qna.CitationClick',
    analyticsPayloadBuilder: (state): Qna.CitationClick => {
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
): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/hoverCitation',
    __legacy__getBuilder: (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      const citation = citationSourceSelector(state, citationId);

      if (!generativeQuestionAnsweringId || !citation) {
        return null;
      }
      return client.makeGeneratedAnswerSourceHover({
        generativeQuestionAnsweringId,
        permanentId: citation.permanentid,
        citationId: citation.id,
        citationHoverTimeMs: citationHoverTimeInMs,
      });
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

export const logLikeGeneratedAnswer = (): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/like',
    __legacy__getBuilder: (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.makeLikeGeneratedAnswer({
        generativeQuestionAnsweringId,
      });
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

export const logDislikeGeneratedAnswer = (): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/dislike',
    __legacy__getBuilder: (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.makeDislikeGeneratedAnswer({
        generativeQuestionAnsweringId,
      });
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
): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/sendFeedback',
    __legacy__getBuilder: (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.makeGeneratedAnswerFeedbackSubmit({
        generativeQuestionAnsweringId,
        reason: feedback,
      });
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
): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/sendFeedback',
    __legacy__getBuilder: (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.makeGeneratedAnswerFeedbackSubmit({
        generativeQuestionAnsweringId,
        reason: 'other',
        details,
      });
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
): CustomAction =>
  makeAnalyticsAction(
    'analytics/generatedAnswer/streamEnd',
    (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      const answerTextIsEmpty =
        !state.generatedAnswer?.answer || !state.generatedAnswer?.answer.length;
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.makeGeneratedAnswerStreamEnd({
        generativeQuestionAnsweringId,
        answerGenerated,
        answerTextIsEmpty,
      } as GeneratedAnswerStreamEndMeta);
    }
  );

export const logGeneratedAnswerShowAnswers = (): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/show',
    __legacy__getBuilder: (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.makeGeneratedAnswerShowAnswers({
        generativeQuestionAnsweringId,
      });
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

export const logGeneratedAnswerHideAnswers = (): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/hide',
    __legacy__getBuilder: (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.makeGeneratedAnswerHideAnswers({
        generativeQuestionAnsweringId,
      });
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

export const logCopyGeneratedAnswer = (): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/copy',
    __legacy__getBuilder: (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.makeGeneratedAnswerCopyToClipboard({
        generativeQuestionAnsweringId,
      });
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

export const generatedAnswerAnalyticsClient = {
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
