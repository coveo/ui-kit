import {Qna} from '@coveo/relay-event-types';
import {
  InsightAction,
  makeInsightAnalyticsActionFactory,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
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

//TODO: SFINT-5435
export const logRephraseGeneratedAnswer = (
  responseFormat: GeneratedResponseFormat
): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.rephraseGeneratedAnswer)(
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
        return client.logOpenGeneratedAnswerSource(
          {
            generativeQuestionAnsweringId,
            permanentId: citation.permanentid,
            citationId: citation.id,
          },
          getCaseContextAnalyticsMetadata(state.insightCaseContext)
        );
      },
      analyticsType: 'Qna.CitationClick',
      analyticsPayloadBuilder: (state): Qna.CitationClick => {
        const generativeQuestionAnsweringId =
          generativeQuestionAnsweringIdSelector(state);
        return {
          answer: {
            id: generativeQuestionAnsweringId!,
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
          type: RGAType,
        },
        feedback: {
          liked: true,
        },
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
    analyticsType: 'Qna.SubmitFeedback',
    analyticsPayloadBuilder: (state): Qna.SubmitFeedback => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      return {
        answer: {
          id: generativeQuestionAnsweringId!,
          type: RGAType,
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
          type: RGAType,
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
          type: RGAType,
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
  makeInsightAnalyticsActionFactory(SearchPageEvents.generatedAnswerStreamEnd)(
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
    analyticsType: 'Qna.AnswerAction',
    analyticsPayloadBuilder: (state): Qna.AnswerAction => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      return {
        action: 'show',
        answer: {
          id: generativeQuestionAnsweringId!,
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
          type: RGAType,
        },
      };
    },
  });

export const logExpandGeneratedAnswer = (): InsightAction =>
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
      return client.logExpandGeneratedAnswer(
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
        action: 'expand',
        answer: {
          id: generativeQuestionAnsweringId!,
          type: RGAType,
        },
      };
    },
  });

export const logCollapseGeneratedAnswer = (): InsightAction =>
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
      return client.logCollapseGeneratedAnswer(
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
        action: 'collapse',
        answer: {
          id: generativeQuestionAnsweringId!,
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
  logGeneratedAnswerDetailedFeedback,
  logGeneratedAnswerFeedback,
  logDislikeGeneratedAnswer,
  logLikeGeneratedAnswer,
  logHoverCitation,
  logOpenGeneratedAnswerSource,
  logRetryGeneratedAnswer,
  logRephraseGeneratedAnswer,
  logExpandGeneratedAnswer,
  logCollapseGeneratedAnswer,
};
