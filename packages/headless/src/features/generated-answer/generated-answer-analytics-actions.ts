import type {Rga} from '@coveo/relay-event-types';
import {
  type CustomAction,
  citationDocumentIdentifier,
  type LegacySearchAction,
  makeAnalyticsAction,
  partialCitationInformation,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import type {SearchAction} from '../search/search-actions.js';
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

type GeneratedAnswerAnalyticsOptions = {
  answerId?: string;
  conversationId?: string;
};

//TODO: KIT-2859
export const logRetryGeneratedAnswer = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/generatedAnswer/retry', (client) =>
    client.makeRetryGeneratedAnswer()
  );

// TODO: SFINT-6665
// In the next major version, make `options.answerId` required and remove the
// fallback to `generativeQuestionAnsweringIdSelector(state)`.
export function logOpenGeneratedAnswerSource(
  citationId: string,
  options?: GeneratedAnswerAnalyticsOptions
): CustomAction {
  const answerId = options?.answerId;
  const conversationId = options?.conversationId;
  return makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/openAnswerSource',
    __legacy__getBuilder: (client, state) => {
      const resolvedAnswerId =
        answerId ?? generativeQuestionAnsweringIdSelector(state);
      const citation = citationSourceSelector(state, citationId);
      if (!resolvedAnswerId || !citation) {
        return null;
      }

      return client.makeGeneratedAnswerCitationClick(
        partialCitationInformation(citation, state),
        {
          generativeQuestionAnsweringId: resolvedAnswerId,
          citationId: citation.id,
          documentId: citationDocumentIdentifier(citation),
          ...(conversationId && {conversationId}),
        }
      );
    },
    analyticsType: 'Rga.CitationClick',
    analyticsPayloadBuilder: (state): Rga.CitationClick | undefined => {
      const citation = citationSourceSelector(state, citationId);
      const resolvedAnswerId =
        answerId ?? generativeQuestionAnsweringIdSelector(state);
      return {
        answerId: resolvedAnswerId ?? '',
        citationId,
        itemMetadata: {
          uniqueFieldName: 'permanentid',
          uniqueFieldValue: citation?.permanentid ?? '',
          title: citation?.title,
          url: citation?.clickUri,
        },
      };
    },
  });
}

// TODO: SFINT-6665
// In the next major version, make `options.answerId` required and remove the
// fallback to `generativeQuestionAnsweringIdSelector(state)`.
export function logHoverCitation(
  citationId: string,
  citationHoverTimeInMs: number,
  options?: GeneratedAnswerAnalyticsOptions
): CustomAction {
  const answerId = options?.answerId;
  const conversationId = options?.conversationId;

  return makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/hoverCitation',
    __legacy__getBuilder: (client, state) => {
      const resolvedAnswerId =
        answerId ?? generativeQuestionAnsweringIdSelector(state);
      const citation = citationSourceSelector(state, citationId);

      if (!resolvedAnswerId || !citation) {
        return null;
      }
      return client.makeGeneratedAnswerSourceHover({
        generativeQuestionAnsweringId: resolvedAnswerId,
        permanentId: citation.permanentid,
        citationId: citation.id,
        citationHoverTimeMs: citationHoverTimeInMs,
        ...(conversationId && {conversationId}),
      });
    },
    analyticsType: 'Rga.CitationHover',
    analyticsPayloadBuilder: (state): Rga.CitationHover | undefined => {
      const citation = citationSourceSelector(state, citationId);
      const resolvedAnswerId =
        answerId ?? generativeQuestionAnsweringIdSelector(state);
      return {
        answerId: resolvedAnswerId ?? '',
        citationId,
        itemMetadata: {
          uniqueFieldName: 'permanentid',
          uniqueFieldValue: citation?.permanentid ?? '',
          title: citation?.title,
          url: citation?.clickUri,
        },
        citationHoverTimeInMs,
      };
    },
  });
}

// TODO: SFINT-6665
// In the next major version, make `options.answerId` required and remove the
// fallback to `generativeQuestionAnsweringIdSelector(state)`.
export function logLikeGeneratedAnswer(
  options?: GeneratedAnswerAnalyticsOptions
): CustomAction {
  const answerId = options?.answerId;
  const conversationId = options?.conversationId;
  return makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/like',
    __legacy__getBuilder: (client, state) => {
      const resolvedAnswerId =
        answerId ?? generativeQuestionAnsweringIdSelector(state);
      if (!resolvedAnswerId) {
        return null;
      }
      return client.makeLikeGeneratedAnswer({
        generativeQuestionAnsweringId: resolvedAnswerId,
        ...(conversationId && {conversationId}),
      });
    },
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      const resolvedAnswerId =
        answerId ?? generativeQuestionAnsweringIdSelector(state);
      return {
        answerId: resolvedAnswerId ?? '',
        action: 'like',
      };
    },
  });
}

// TODO: SFINT-6665
// In the next major version, make `options.answerId` required and remove the
// fallback to `generativeQuestionAnsweringIdSelector(state)`.
export function logDislikeGeneratedAnswer(
  options?: GeneratedAnswerAnalyticsOptions
): CustomAction {
  const answerId = options?.answerId;
  const conversationId = options?.conversationId;
  return makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/dislike',
    __legacy__getBuilder: (client, state) => {
      const resolvedAnswerId =
        answerId ?? generativeQuestionAnsweringIdSelector(state);
      if (!resolvedAnswerId) {
        return null;
      }
      return client.makeDislikeGeneratedAnswer({
        generativeQuestionAnsweringId: resolvedAnswerId,
        ...(conversationId && {conversationId}),
      });
    },
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      const resolvedAnswerId =
        answerId ?? generativeQuestionAnsweringIdSelector(state);
      return {
        answerId: resolvedAnswerId ?? '',
        action: 'dislike',
      };
    },
  });
}

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
      return client.makeGeneratedAnswerFeedbackSubmitV2({
        generativeQuestionAnsweringId,
        ...feedback,
      });
    },
    analyticsType: 'Rga.SubmitFeedback',
    analyticsPayloadBuilder: (state): Rga.SubmitFeedback | undefined => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
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
        answerId: generativeQuestionAnsweringId ?? '',
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
    },
  });

// TODO: SFINT-5435
// TODO: In the next major version, make `answerId` required and remove the fallback
// to `generativeQuestionAnsweringIdSelector(state)`.
export const logGeneratedAnswerStreamEnd = (
  answerGenerated: boolean,
  answerId?: string,
  answerTextIsEmpty?: boolean,
  conversationId?: string
): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/streamEnd',
    __legacy__getBuilder: (client, state) => {
      const generativeQuestionAnsweringId =
        answerId ?? generativeQuestionAnsweringIdSelector(state);
      const resolvedAnswerTextIsEmpty = answerGenerated
        ? (answerTextIsEmpty ??
          (!state.generatedAnswer?.answer ||
            !state.generatedAnswer?.answer.length))
        : undefined;
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.makeGeneratedAnswerStreamEnd({
        generativeQuestionAnsweringId,
        answerGenerated,
        answerTextIsEmpty: resolvedAnswerTextIsEmpty,
        ...(conversationId && {conversationId}),
      });
    },
    analyticsType: 'Rga.AnswerReceived',
    analyticsPayloadBuilder: (state): Rga.AnswerReceived | undefined => {
      const generativeQuestionAnsweringId =
        answerId ?? generativeQuestionAnsweringIdSelector(state);
      return {
        answerId: generativeQuestionAnsweringId ?? '',
        answerGenerated: answerGenerated ?? false,
      };
    },
  });

export const logGeneratedAnswerResponseLinked = (
  answerId?: string
): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/responseLinked',
    __legacy__getBuilder: () => {
      return null;
    },
    analyticsType: 'Rga.ResponseLinked',
    analyticsPayloadBuilder: (state): Rga.ResponseLinked | undefined => {
      const generativeQuestionAnsweringId =
        answerId ?? generativeQuestionAnsweringIdSelector(state);
      return {
        answerId: generativeQuestionAnsweringId ?? '',
        responseId:
          state.search?.searchResponseId ||
          state.search?.response.searchUid ||
          '',
      };
    },
  });

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
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      return {
        answerId: generativeQuestionAnsweringId ?? '',
        action: 'show',
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
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      return {
        answerId: generativeQuestionAnsweringId ?? '',
        action: 'hide',
      };
    },
  });

export const logGeneratedAnswerExpand = (): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/expand',
    __legacy__getBuilder: (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.makeGeneratedAnswerExpand({
        generativeQuestionAnsweringId,
      });
    },
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      return {
        answerId: generativeQuestionAnsweringId ?? '',
        action: 'expand',
      };
    },
  });

export const logGeneratedAnswerCollapse = (): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/collapse',
    __legacy__getBuilder: (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.makeGeneratedAnswerCollapse({
        generativeQuestionAnsweringId,
      });
    },
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      return {
        answerId: generativeQuestionAnsweringId ?? '',
        action: 'collapse',
      };
    },
  });

// TODO: SFINT-6665
// In the next major version, make `options.answerId` required and remove the
// fallback to `generativeQuestionAnsweringIdSelector(state)`.
export function logCopyGeneratedAnswer(
  options?: GeneratedAnswerAnalyticsOptions
): CustomAction {
  const answerId = options?.answerId;
  const conversationId = options?.conversationId;
  return makeAnalyticsAction({
    prefix: 'analytics/generatedAnswer/copy',
    __legacy__getBuilder: (client, state) => {
      const resolvedAnswerId =
        answerId ?? generativeQuestionAnsweringIdSelector(state);
      if (!resolvedAnswerId) {
        return null;
      }
      return client.makeGeneratedAnswerCopyToClipboard({
        generativeQuestionAnsweringId: resolvedAnswerId,
        ...(conversationId && {conversationId}),
      });
    },
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      const resolvedAnswerId =
        answerId ?? generativeQuestionAnsweringIdSelector(state);
      return {
        answerId: resolvedAnswerId ?? '',
        action: 'copyToClipboard',
      };
    },
  });
}

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
