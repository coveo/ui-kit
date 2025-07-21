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
        const {id: rgaID, answerAPIEnabled} =
          generativeQuestionAnsweringIdSelector(state);
        const citation = citationSourceSelector(state, citationId);

        if (!rgaID || !citation) {
          return null;
        }
        return client.logGeneratedAnswerCitationClick(
          partialCitationInformation(citation, state),
          {
            ...(answerAPIEnabled
              ? {answerAPIStreamId: rgaID}
              : {generativeQuestionAnsweringId: rgaID}),
            citationId: citation.id,
            documentId: citationDocumentIdentifier(citation),
          },
          getCaseContextAnalyticsMetadata(state.insightCaseContext)
        );
      },
      analyticsType: 'Rga.CitationClick',
      analyticsPayloadBuilder: (state): Rga.CitationClick | undefined => {
        const citation = citationSourceSelector(state, citationId);
        return {
          answerId: state.search?.response.searchUid || '',
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
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      const citation = citationSourceSelector(state, citationId);

      if (!rgaID || !citation) {
        return null;
      }
      return client.logGeneratedAnswerSourceHover(
        {
          ...(answerAPIEnabled
            ? {answerAPIStreamId: rgaID}
            : {generativeQuestionAnsweringId: rgaID}),
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
      return {
        answerId: state.search?.response.searchUid || '',
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
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      if (!rgaID) {
        return null;
      }
      return client.logLikeGeneratedAnswer(
        {
          ...(answerAPIEnabled
            ? {answerAPIStreamId: rgaID}
            : {generativeQuestionAnsweringId: rgaID}),
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    },
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      return {
        answerId: state.search?.response.searchUid || '',
        action: 'like',
      };
    },
  });

export const logDislikeGeneratedAnswer = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.dislikeGeneratedAnswer)({
    prefix: 'analytics/generatedAnswer/dislike',
    __legacy__getBuilder: (client, state) => {
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      if (!rgaID) {
        return null;
      }
      return client.logDislikeGeneratedAnswer(
        {
          ...(answerAPIEnabled
            ? {answerAPIStreamId: rgaID}
            : {generativeQuestionAnsweringId: rgaID}),
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    },
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      return {
        answerId: state.search?.response.searchUid || '',
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
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      if (!rgaID) {
        return null;
      }
      return client.logGeneratedAnswerFeedbackSubmitV2(
        {
          ...(answerAPIEnabled
            ? {answerAPIStreamId: rgaID}
            : {generativeQuestionAnsweringId: rgaID}),
          ...feedback,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    },
    analyticsType: 'Rga.SubmitFeedback',
    analyticsPayloadBuilder: (state): Rga.SubmitFeedback | undefined => {
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
        answerId: state.search?.response.searchUid || '',
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
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      const answerTextIsEmpty = answerGenerated
        ? !state.generatedAnswer?.answer ||
          !state.generatedAnswer?.answer.length
        : undefined;
      if (!rgaID) {
        return null;
      }
      return client.logGeneratedAnswerStreamEnd(
        {
          ...(answerAPIEnabled
            ? {answerAPIStreamId: rgaID}
            : {generativeQuestionAnsweringId: rgaID}),
          answerGenerated,
          answerTextIsEmpty,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    },
    analyticsType: 'Rga.AnswerReceived',
    analyticsPayloadBuilder: (state): Rga.AnswerReceived | undefined => {
      return {
        answerId: state.search?.response.searchUid || '',
        answerGenerated,
      };
    },
  });

export const logGeneratedAnswerShowAnswers = (): InsightAction =>
  makeInsightAnalyticsActionFactory(
    SearchPageEvents.generatedAnswerShowAnswers
  )({
    prefix: 'analytics/generatedAnswer/show',
    __legacy__getBuilder: (client, state) => {
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      if (!rgaID) {
        return null;
      }
      return client.logGeneratedAnswerShowAnswers(
        {
          ...(answerAPIEnabled
            ? {answerAPIStreamId: rgaID}
            : {generativeQuestionAnsweringId: rgaID}),
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    },
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      return {
        answerId: state.search?.response.searchUid || '',
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
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      if (!rgaID) {
        return null;
      }
      return client.logGeneratedAnswerHideAnswers(
        {
          ...(answerAPIEnabled
            ? {answerAPIStreamId: rgaID}
            : {generativeQuestionAnsweringId: rgaID}),
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    },
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      return {
        answerId: state.search?.response.searchUid || '',
        action: 'hide',
      };
    },
  });

export const logGeneratedAnswerExpand = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.generatedAnswerExpand)({
    prefix: 'analytics/generatedAnswer/expand',
    __legacy__getBuilder: (client, state) => {
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      if (!rgaID) {
        return null;
      }
      return client.logGeneratedAnswerExpand(
        {
          ...(answerAPIEnabled
            ? {answerAPIStreamId: rgaID}
            : {generativeQuestionAnsweringId: rgaID}),
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    },
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      return {
        answerId: state.search?.response.searchUid || '',
        action: 'expand',
      };
    },
  });

export const logGeneratedAnswerCollapse = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.generatedAnswerCollapse)({
    prefix: 'analytics/generatedAnswer/collapse',
    __legacy__getBuilder: (client, state) => {
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      if (!rgaID) {
        return null;
      }
      return client.logGeneratedAnswerCollapse(
        {
          ...(answerAPIEnabled
            ? {answerAPIStreamId: rgaID}
            : {generativeQuestionAnsweringId: rgaID}),
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    },
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      return {
        answerId: state.search?.response.searchUid || '',
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
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      if (!rgaID) {
        return null;
      }
      return client.logGeneratedAnswerCopyToClipboard(
        {
          ...(answerAPIEnabled
            ? {answerAPIStreamId: rgaID}
            : {generativeQuestionAnsweringId: rgaID}),
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    },
    analyticsType: 'Rga.AnswerAction',
    analyticsPayloadBuilder: (state): Rga.AnswerAction | undefined => {
      return {
        answerId: state.search?.response.searchUid || '',
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
