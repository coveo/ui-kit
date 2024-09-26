import {Qna} from '@coveo/relay-event-types';
import {
  InsightAction,
  makeInsightAnalyticsActionFactory,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';
import {GeneratedAnswerFeedback} from './generated-answer-analytics-actions.js';
import {
  citationSourceSelector,
  generativeQuestionAnsweringIdSelector,
} from './generated-answer-selectors.js';

const RGAType = 'RGA';

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
        return client.logOpenGeneratedAnswerSource(
          {
            ...(answerAPIEnabled
              ? {answerAPIStreamId: rgaID}
              : {generativeQuestionAnsweringId: rgaID}),
            permanentId: citation.permanentid,
            citationId: citation.id,
          },
          getCaseContextAnalyticsMetadata(state.insightCaseContext)
        );
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
    analyticsType: 'Qna.SubmitRgaFeedback',
    analyticsPayloadBuilder: (state): Qna.SubmitRgaFeedback => {
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
    },
  });

//TODO: SFINT-5435
export const logGeneratedAnswerStreamEnd = (
  answerGenerated: boolean
): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.generatedAnswerStreamEnd)(
    'analytics/generatedAnswer/streamEnd',
    (client, state) => {
      const {id: rgaID, answerAPIEnabled} =
        generativeQuestionAnsweringIdSelector(state);
      if (!rgaID) {
        return null;
      }
      return client.logGeneratedAnswerStreamEnd(
        {
          ...(answerAPIEnabled
            ? {answerAPIStreamId: rgaID}
            : {generativeQuestionAnsweringId: rgaID}),
          answerGenerated,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );

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
