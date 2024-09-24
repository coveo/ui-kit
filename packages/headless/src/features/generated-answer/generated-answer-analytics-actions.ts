import {Rga} from '@coveo/relay-event-types';
import {
  CustomAction,
  LegacySearchAction,
  makeAnalyticsAction,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {SearchAction} from '../search/search-actions.js';
import {
  citationSourceSelector,
  generativeQuestionAnsweringIdSelector,
} from './generated-answer-selectors.js';

export type GeneratedAnswerFeedbackOption = 'yes' | 'unknown' | 'no';

export type GeneratedAnswerFeedback = {
  helpful: boolean;
  documented: GeneratedAnswerFeedbackOption;
  correctTopic: GeneratedAnswerFeedbackOption;
  hallucinationFree: GeneratedAnswerFeedbackOption;
  readable: GeneratedAnswerFeedbackOption;
  details?: string;
  documentUrl?: string;
};

export const parseEvaluationDetails = (
  detail: 'yes' | 'no' | 'unknown'
): boolean | undefined => {
  if (detail === 'yes') {
    return true;
  }
  if (detail === 'no') {
    return false;
  }
  return undefined;
};

//TODO: KIT-2859
export const logRetryGeneratedAnswer = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/generatedAnswer/retry', (client) =>
    client.makeRetryGeneratedAnswer()
  );

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
    analyticsType: 'Rga.CitationClick',
    analyticsPayloadBuilder: (state): Rga.CitationClick | undefined => {
      const citation = citationSourceSelector(state, citationId);
      const {id: rgaID} = generativeQuestionAnsweringIdSelector(state);
      if (rgaID) {
        return {
          responseId: rgaID ?? '',
          citationId,
          itemMetadata: {
            uniqueFieldName: 'permanentid',
            uniqueFieldValue: citation?.permanentid ?? '',
            title: citation?.title,
            url: citation?.clickUri,
          },
        };
      }
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
    analyticsType: 'Rga.CitationHover',
    analyticsPayloadBuilder: (state): Rga.CitationHover | undefined => {
      const citation = citationSourceSelector(state, citationId);
      const {id: rgaID} = generativeQuestionAnsweringIdSelector(state);
      if (rgaID) {
        return {
          responseId: rgaID,
          citationId,
          itemMetadata: {
            uniqueFieldName: 'permanentid',
            uniqueFieldValue: citation?.permanentid ?? '',
            title: citation?.title,
            url: citation?.clickUri,
          },
          citationHoverTimeInMs,
        };
      }
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
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      const {id: rgaID} = generativeQuestionAnsweringIdSelector(state);
      if (rgaID) {
        return {
          responseId: rgaID,
          action: 'like',
        };
      }
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
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      const {id: rgaID} = generativeQuestionAnsweringIdSelector(state);
      if (rgaID) {
        return {
          responseId: rgaID,
          action: 'dislike',
        };
      }
    },
  });

export const logGeneratedAnswerFeedback = (
  feedback: GeneratedAnswerFeedback
): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/sendFeedback',
    __legacy__getBuilder: (client, state) => {
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      if (!rgaID) {
        return null;
      }
      return client.makeGeneratedAnswerFeedbackSubmitV2({
        ...(answerAPIEnabled
          ? {answerAPIStreamId: rgaID}
          : {generativeQuestionAnsweringId: rgaID}),
        ...feedback,
      });
    },
    analyticsType: 'Rga.SubmitRgaFeedback',
    analyticsPayloadBuilder: (state): Rga.SubmitFeedback | undefined => {
      const {id: rgaID} = generativeQuestionAnsweringIdSelector(state);
      if (rgaID) {
        const {
          helpful,
          readable,
          documented,
          hallucinationFree,
          correctTopic,
          documentUrl,
          details,
        } = feedback;
        return {
          responseId: rgaID,
          helpful,
          details: {
            readable: parseEvaluationDetails(readable),
            documented: parseEvaluationDetails(documented),
            correctTopic: parseEvaluationDetails(correctTopic),
            hallucinationFree: parseEvaluationDetails(hallucinationFree),
          },
          additionalNotes: details,
          correctAnswerUrl: documentUrl,
        };
      }
    },
  });

//TODO: SFINT-5435
export const logGeneratedAnswerStreamEnd = (
  answerGenerated: boolean
): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/streamEnd',
    __legacy__getBuilder: (client, state) => {
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
    },
    analyticsType: 'Rga.StreamEnd',
    analyticsPayloadBuilder: (state): Rga.StreamEnd | undefined => {
      const {id: rgaID} = generativeQuestionAnsweringIdSelector(state);
      if (rgaID) {
        return {
          responseId: rgaID,
          answerGenerated: true,
        };
      }
    },
  });

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
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      const {id: rgaID} = generativeQuestionAnsweringIdSelector(state);
      if (rgaID) {
        return {
          responseId: rgaID,
          action: 'show',
        };
      }
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
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      const {id: rgaID} = generativeQuestionAnsweringIdSelector(state);
      if (rgaID) {
        return {
          responseId: rgaID,
          action: 'hide',
        };
      }
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
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      const {id: rgaID} = generativeQuestionAnsweringIdSelector(state);
      if (rgaID) {
        return {
          responseId: rgaID,
          action: 'expand',
        };
      }
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
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      const {id: rgaID} = generativeQuestionAnsweringIdSelector(state);
      if (rgaID) {
        return {
          responseId: rgaID,
          action: 'collapse',
        };
      }
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
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      const {id: rgaID} = generativeQuestionAnsweringIdSelector(state);
      if (rgaID) {
        return {
          responseId: rgaID,
          action: 'copyToClipboard',
        };
      }
    },
  });

export const retryGeneratedAnswer = (): SearchAction => ({
  actionCause: SearchPageEvents.retryGeneratedAnswer,
});

export const generatedAnswerAnalyticsClient = {
  logCopyGeneratedAnswer,
  logGeneratedAnswerHideAnswers,
  logGeneratedAnswerShowAnswers,
  logGeneratedAnswerStreamEnd,
  logGeneratedAnswerFeedback,
  logDislikeGeneratedAnswer,
  logLikeGeneratedAnswer,
  logHoverCitation,
  logOpenGeneratedAnswerSource,
  logRetryGeneratedAnswer,
  logGeneratedAnswerExpand,
  logGeneratedAnswerCollapse,
};
