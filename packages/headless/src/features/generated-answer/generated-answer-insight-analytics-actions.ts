import {Rga} from '@coveo/relay-event-types';
import {parseEvaluationDetails} from '../../controllers/knowledge/generated-answer/headless-answerapi-generated-answer';
import {
  InsightAction,
  makeInsightAnalyticsActionFactory,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';
import {GeneratedAnswerFeedback} from './generated-answer-analytics-actions';
import {
  citationSourceSelector,
  generativeQuestionAnsweringIdSelector,
} from './generated-answer-selectors';

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
      const {id: rgaID} = generativeQuestionAnsweringIdSelector(state);
      if (rgaID) {
        return {
          responseId: rgaID,
          action: 'like',
        };
      }
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
            readable: parseEvaluationDetails(readable) ?? undefined,
            documented: parseEvaluationDetails(documented) ?? undefined,
            correctTopic: parseEvaluationDetails(correctTopic) ?? undefined,
            hallucinationFree:
              parseEvaluationDetails(hallucinationFree) ?? undefined,
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
    analyticsType: 'Rga.StreamEnd',
    analyticsPayloadBuilder: (state): Rga.StreamEnd | undefined => {
      const {id: rgaID} = generativeQuestionAnsweringIdSelector(state);
      if (rgaID) {
        return {
          responseId: rgaID,
          answerGenerated,
        };
      }
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
      const {id: rgaID} = generativeQuestionAnsweringIdSelector(state);
      if (rgaID) {
        return {
          responseId: rgaID,
          action: 'show',
        };
      }
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
      const {id: rgaID} = generativeQuestionAnsweringIdSelector(state);
      if (rgaID) {
        return {
          responseId: rgaID,
          action: 'hide',
        };
      }
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
      const {id: rgaID} = generativeQuestionAnsweringIdSelector(state);
      if (rgaID) {
        return {
          responseId: rgaID,
          action: 'expand',
        };
      }
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
      const {id: rgaID} = generativeQuestionAnsweringIdSelector(state);
      if (rgaID) {
        return {
          responseId: rgaID,
          action: 'collapse',
        };
      }
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
      const {id: rgaID} = generativeQuestionAnsweringIdSelector(state);
      if (rgaID) {
        return {
          responseId: rgaID,
          action: 'copyToClipboard',
        };
      }
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
