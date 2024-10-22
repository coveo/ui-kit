import {Qna} from '@coveo/relay-event-types';
import {
  CustomAction,
  LegacySearchAction,
  makeAnalyticsAction,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {SearchAction} from '../search/search-actions';
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

export type GeneratedAnswerFeedbackOption = 'yes' | 'unknown' | 'no';

export type GeneratedAnswerFeedbackV2 = {
  helpful: boolean;
  documented: GeneratedAnswerFeedbackOption;
  correctTopic: GeneratedAnswerFeedbackOption;
  hallucinationFree: GeneratedAnswerFeedbackOption;
  readable: GeneratedAnswerFeedbackOption;
  details?: string;
  documentUrl?: string;
};
const RGAType = 'RGA';

export function isGeneratedAnswerFeedbackV2(
  feedback: GeneratedAnswerFeedback | GeneratedAnswerFeedbackV2
): feedback is GeneratedAnswerFeedbackV2 {
  return typeof feedback === 'object';
}

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
    const {id: rgaID, answerAPIEnabled} =
      generativeQuestionAnsweringIdSelector(state);
    if (!rgaID) {
      return null;
    }
    return client.makeRephraseGeneratedAnswer({
      ...(answerAPIEnabled
        ? {answerAPIStreamId: rgaID}
        : {generativeQuestionAnsweringId: rgaID}),
      rephraseFormat: responseFormat.answerStyle,
    });
  });

export const logOpenGeneratedAnswerSource = (
  citationId: string
): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/openAnswerSource',
    __legacy__getBuilder: (client, state) => {
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      const citation = citationSourceSelector(state, citationId);
      if (!rgaID || !citation) {
        return null;
      }

      return client.makeOpenGeneratedAnswerSource({
        ...(answerAPIEnabled
          ? {answerAPIStreamId: rgaID}
          : {generativeQuestionAnsweringId: rgaID}),
        permanentId: citation.permanentid,
        citationId: citation.id,
      });
    },
    analyticsType: 'Qna.CitationClick',
    analyticsPayloadBuilder: (state): Qna.CitationClick => {
      return {
        answer: {
          responseId: state.search?.response.searchUid || '',
          type: RGAType,
        },
        citation: {
          id: citationId,
          type: 'Source',
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
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      const citation = citationSourceSelector(state, citationId);

      if (!rgaID || !citation) {
        return null;
      }
      return client.makeGeneratedAnswerSourceHover({
        ...(answerAPIEnabled
          ? {answerAPIStreamId: rgaID}
          : {generativeQuestionAnsweringId: rgaID}),
        permanentId: citation.permanentid,
        citationId: citation.id,
        citationHoverTimeMs: citationHoverTimeInMs,
      });
    },
    analyticsType: 'Qna.CitationHover',
    analyticsPayloadBuilder: (state): Qna.CitationHover => {
      return {
        answer: {
          responseId: state.search?.response.searchUid || '',
          type: RGAType,
        },
        citation: {
          id: citationId,
          type: 'Source',
        },
        citationHoverTimeInMs,
      };
    },
  });

export const logLikeGeneratedAnswer = (): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/like',
    __legacy__getBuilder: (client, state) => {
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      if (!rgaID) {
        return null;
      }
      return client.makeLikeGeneratedAnswer({
        ...(answerAPIEnabled
          ? {answerAPIStreamId: rgaID}
          : {generativeQuestionAnsweringId: rgaID}),
      });
    },
    analyticsType: 'Qna.AnswerAction',
    analyticsPayloadBuilder: (state): Qna.AnswerAction => {
      return {
        action: 'like',
        answer: {
          responseId: state.search?.response.searchUid || '',
          type: RGAType,
        },
      };
    },
  });

export const logDislikeGeneratedAnswer = (): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/dislike',
    __legacy__getBuilder: (client, state) => {
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      if (!rgaID) {
        return null;
      }
      return client.makeDislikeGeneratedAnswer({
        ...(answerAPIEnabled
          ? {answerAPIStreamId: rgaID}
          : {generativeQuestionAnsweringId: rgaID}),
      });
    },
    analyticsType: 'Qna.AnswerAction',
    analyticsPayloadBuilder: (state): Qna.AnswerAction => {
      return {
        action: 'dislike',
        answer: {
          responseId: state.search?.response.searchUid || '',
          type: RGAType,
        },
      };
    },
  });

export const logGeneratedAnswerFeedback = (
  feedback: GeneratedAnswerFeedback | GeneratedAnswerFeedbackV2
): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/sendFeedback',
    __legacy__getBuilder: (client, state) => {
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      if (!rgaID) {
        return null;
      }

      const genAiID = answerAPIEnabled
        ? {answerAPIStreamId: rgaID}
        : {generativeQuestionAnsweringId: rgaID};

      return isGeneratedAnswerFeedbackV2(feedback)
        ? client.makeGeneratedAnswerFeedbackSubmitV2({
            ...genAiID,
            ...feedback,
          })
        : client.makeGeneratedAnswerFeedbackSubmit({
            ...genAiID,
            reason: feedback,
          });
    },
    analyticsType: isGeneratedAnswerFeedbackV2(feedback)
      ? 'Qna.SubmitRgaFeedback'
      : undefined,
    analyticsPayloadBuilder: isGeneratedAnswerFeedbackV2(feedback)
      ? (state): Qna.SubmitRgaFeedback => {
          const {search} = state;
          const {response} = search || {};
          const responseId = response?.searchUid || '';
          const {
            helpful,
            readable,
            documented,
            details,
            hallucinationFree: hallucination_free,
            correctTopic: correct_topic,
            documentUrl: document_url,
          } = feedback;
          return {
            answer: {
              responseId,
            },
            feedback: {
              helpful,
              readable,
              documented,
              details,
              hallucination_free,
              correct_topic,
              document_url,
            },
          };
        }
      : undefined,
  });

//Method deprecated after v3, it will no longer be used, TODO: SFINT-5585
export const logGeneratedAnswerDetailedFeedback = (
  details: string
): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/sendFeedback',
    __legacy__getBuilder: (client, state) => {
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      if (!rgaID) {
        return null;
      }

      return client.makeGeneratedAnswerFeedbackSubmit({
        ...(answerAPIEnabled
          ? {answerAPIStreamId: rgaID}
          : {generativeQuestionAnsweringId: rgaID}),
        reason: 'other',
        details,
      });
    },
  });

//TODO: SFINT-5435
export const logGeneratedAnswerStreamEnd = (
  answerGenerated: boolean
): CustomAction =>
  makeAnalyticsAction(
    'analytics/generatedAnswer/streamEnd',
    (client, state) => {
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      const answerTextIsEmpty = answerGenerated
        ? !state.generatedAnswer?.answer ||
          !state.generatedAnswer?.answer.length
        : undefined;
      if (!rgaID) {
        return null;
      }
      return client.makeGeneratedAnswerStreamEnd({
        ...(answerAPIEnabled
          ? {answerAPIStreamId: rgaID}
          : {generativeQuestionAnsweringId: rgaID}),
        answerGenerated,
        answerTextIsEmpty,
      });
    }
  );

export const logGeneratedAnswerShowAnswers = (): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/show',
    __legacy__getBuilder: (client, state) => {
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      if (!rgaID) {
        return null;
      }
      return client.makeGeneratedAnswerShowAnswers({
        ...(answerAPIEnabled
          ? {answerAPIStreamId: rgaID}
          : {generativeQuestionAnsweringId: rgaID}),
      });
    },
    analyticsType: 'Qna.AnswerAction',
    analyticsPayloadBuilder: (state): Qna.AnswerAction => {
      return {
        action: 'show',
        answer: {
          responseId: state.search?.response.searchUid || '',
          type: RGAType,
        },
      };
    },
  });

export const logGeneratedAnswerHideAnswers = (): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/hide',
    __legacy__getBuilder: (client, state) => {
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      if (!rgaID) {
        return null;
      }
      return client.makeGeneratedAnswerHideAnswers({
        ...(answerAPIEnabled
          ? {answerAPIStreamId: rgaID}
          : {generativeQuestionAnsweringId: rgaID}),
      });
    },
    analyticsType: 'Qna.AnswerAction',
    analyticsPayloadBuilder: (state): Qna.AnswerAction => {
      return {
        action: 'hide',
        answer: {
          responseId: state.search?.response.searchUid || '',
          type: RGAType,
        },
      };
    },
  });

export const logGeneratedAnswerExpand = (): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/expand',
    __legacy__getBuilder: (client, state) => {
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      if (!rgaID) {
        return null;
      }
      return client.makeGeneratedAnswerExpand({
        ...(answerAPIEnabled
          ? {answerAPIStreamId: rgaID}
          : {generativeQuestionAnsweringId: rgaID}),
      });
    },
    analyticsType: 'Qna.AnswerAction',
    analyticsPayloadBuilder: (state): Qna.AnswerAction => {
      return {
        action: 'expand',
        answer: {
          responseId: state.search?.response.searchUid || '',
          type: RGAType,
        },
      };
    },
  });

export const logGeneratedAnswerCollapse = (): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/collapse',
    __legacy__getBuilder: (client, state) => {
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      if (!rgaID) {
        return null;
      }
      return client.makeGeneratedAnswerCollapse({
        ...(answerAPIEnabled
          ? {answerAPIStreamId: rgaID}
          : {generativeQuestionAnsweringId: rgaID}),
      });
    },
    analyticsType: 'Qna.AnswerAction',
    analyticsPayloadBuilder: (state): Qna.AnswerAction => {
      return {
        action: 'collapse',
        answer: {
          responseId: state.search?.response.searchUid || '',
          type: RGAType,
        },
      };
    },
  });

export const logCopyGeneratedAnswer = (): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/copy',
    __legacy__getBuilder: (client, state) => {
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      if (!rgaID) {
        return null;
      }
      return client.makeGeneratedAnswerCopyToClipboard({
        ...(answerAPIEnabled
          ? {answerAPIStreamId: rgaID}
          : {generativeQuestionAnsweringId: rgaID}),
      });
    },
    analyticsType: 'Qna.AnswerAction',
    analyticsPayloadBuilder: (state): Qna.AnswerAction => {
      return {
        action: 'copyToClipboard',
        answer: {
          responseId: state.search?.response.searchUid || '',
          type: RGAType,
        },
      };
    },
  });

export const retryGeneratedAnswer = (): SearchAction => ({
  actionCause: SearchPageEvents.retryGeneratedAnswer,
});

export const rephraseGeneratedAnswer = (): SearchAction => ({
  actionCause: SearchPageEvents.rephraseGeneratedAnswer,
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
  logGeneratedAnswerExpand,
  logGeneratedAnswerCollapse,
};
