import type {Rga} from '@coveo/relay-event-types';
import {
  citationDocumentIdentifier,
  type InsightAction,
  makeInsightAnalyticsActionFactory,
  partialCitationInformation,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';
import {
  type GeneratedAnswerFeedback,
  parseEvaluationDetails,
} from './generated-answer-analytics-actions.js';
import {
  citationSourceSelector,
  generativeQuestionAnsweringIdSelector,
} from './generated-answer-selectors.js';

//TODO: SFINT-5435
export const logRetryGeneratedAnswer = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.retryGeneratedAnswer)(
    'analytics/generatedAnswer/retry',
    (client, state) =>
      client.logRetryGeneratedAnswer(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );

export const logOpenGeneratedAnswerSource = (
  citationId: string
): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.openGeneratedAnswerSource)(
    {
      prefix: 'analytics/generatedAnswer/openAnswerSource',
      __legacy__getBuilder: (client, state) => {
        const generativeQuestionAnsweringId =
          generativeQuestionAnsweringIdSelector(state);
        const citation = citationSourceSelector(state, citationId);

        if (!generativeQuestionAnsweringId || !citation) {
          return null;
        }
        return client.logGeneratedAnswerCitationClick(
          partialCitationInformation(citation, state),
          {
            generativeQuestionAnsweringId,
            citationId: citation.id,
            documentId: citationDocumentIdentifier(citation),
          },
          getCaseContextAnalyticsMetadata(state.insightCaseContext)
        );
      },
      analyticsType: 'Rga.CitationClick',
      analyticsPayloadBuilder: (state): Rga.CitationClick | undefined => {
        const citation = citationSourceSelector(state, citationId);
        const generativeQuestionAnsweringId =
          generativeQuestionAnsweringIdSelector(state);
        return {
          answerId: generativeQuestionAnsweringId ?? '',
          citationId,
          itemMetadata: {
            uniqueFieldName: 'permanentid',
            uniqueFieldValue: citation?.permanentid ?? '',
            title: citation?.title,
            url: citation?.clickUri,
          },
        };
      },
    }
  );

export const logHoverCitation = (
  citationId: string,
  citationHoverTimeInMs: number
): InsightAction =>
  makeInsightAnalyticsActionFactory(
    SearchPageEvents.generatedAnswerSourceHover
  )({
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
    analyticsType: 'Rga.CitationHover',
    analyticsPayloadBuilder: (state): Rga.CitationHover | undefined => {
      const citation = citationSourceSelector(state, citationId);
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      return {
        answerId: generativeQuestionAnsweringId ?? '',
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

export const logLikeGeneratedAnswer = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.likeGeneratedAnswer)({
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
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      return {
        answerId: generativeQuestionAnsweringId ?? '',
        action: 'like',
      };
    },
  });

export const logDislikeGeneratedAnswer = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.dislikeGeneratedAnswer)({
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
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      return {
        answerId: generativeQuestionAnsweringId ?? '',
        action: 'dislike',
      };
    },
  });

export const logGeneratedAnswerFeedback = (
  feedback: GeneratedAnswerFeedback
): InsightAction =>
  makeInsightAnalyticsActionFactory(
    SearchPageEvents.generatedAnswerFeedbackSubmit
  )({
    prefix: 'analytics/generatedAnswer/sendFeedback',
    __legacy__getBuilder: (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.logGeneratedAnswerFeedbackSubmitV2(
        {
          generativeQuestionAnsweringId,
          ...feedback,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
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

//TODO: SFINT-5435
export const logGeneratedAnswerStreamEnd = (
  answerGenerated: boolean
): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.generatedAnswerStreamEnd)({
    prefix: 'analytics/generatedAnswer/streamEnd',
    __legacy__getBuilder: (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      const answerTextIsEmpty = answerGenerated
        ? !state.generatedAnswer?.answer ||
          !state.generatedAnswer?.answer.length
        : undefined;
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.logGeneratedAnswerStreamEnd(
        {
          generativeQuestionAnsweringId,
          answerGenerated,
          answerTextIsEmpty,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    },
    analyticsType: 'Rga.AnswerReceived',
    analyticsPayloadBuilder: (state): Rga.AnswerReceived | undefined => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      return {
        answerId: generativeQuestionAnsweringId ?? '',
        answerGenerated,
      };
    },
  });

export const logGeneratedAnswerResponseLinked = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.generatedAnswerStreamEnd)({
    prefix: 'analytics/generatedAnswer/streamEnd',
    __legacy__getBuilder: () => {
      return null;
    },
    analyticsType: 'Rga.ResponseLinked',
    analyticsPayloadBuilder: (state): Rga.ResponseLinked | undefined => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      return {
        answerId: generativeQuestionAnsweringId ?? '',
        responseId:
          state.search?.searchResponseId ||
          state.search?.response.searchUid ||
          '',
      };
    },
  });

export const logGeneratedAnswerShowAnswers = (): InsightAction =>
  makeInsightAnalyticsActionFactory(
    SearchPageEvents.generatedAnswerShowAnswers
  )({
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

export const logGeneratedAnswerHideAnswers = (): InsightAction =>
  makeInsightAnalyticsActionFactory(
    SearchPageEvents.generatedAnswerHideAnswers
  )({
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

export const logGeneratedAnswerExpand = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.generatedAnswerExpand)({
    prefix: 'analytics/generatedAnswer/expand',
    __legacy__getBuilder: (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.logGeneratedAnswerExpand(
        {
          generativeQuestionAnsweringId,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
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

export const logGeneratedAnswerCollapse = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.generatedAnswerCollapse)({
    prefix: 'analytics/generatedAnswer/collapse',
    __legacy__getBuilder: (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.logGeneratedAnswerCollapse(
        {
          generativeQuestionAnsweringId,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
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

export const logCopyGeneratedAnswer = (): InsightAction =>
  makeInsightAnalyticsActionFactory(
    SearchPageEvents.generatedAnswerCopyToClipboard
  )({
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
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      return {
        answerId: generativeQuestionAnsweringId ?? '',
        action: 'copyToClipboard',
      };
    },
  });

export const generatedAnswerInsightAnalyticsClient = {
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
