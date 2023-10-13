import {
  AnalyticsType,
  CustomAction,
  SearchAction,
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

export const logRetryGeneratedAnswer = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/generatedAnswer/retry',
    AnalyticsType.Search,
    (client) => client.makeRetryGeneratedAnswer()
  );

export const logRephraseGeneratedAnswer = (
  responseFormat: GeneratedResponseFormat
): SearchAction =>
  makeAnalyticsAction(
    'analytics/generatedAnswer/rephrase',
    AnalyticsType.Search,
    (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.makeRephraseGeneratedAnswer({
        generativeQuestionAnsweringId,
        rephraseFormat: responseFormat.answerStyle,
      });
    }
  );

export const logOpenGeneratedAnswerSource = (
  citationId: string
): CustomAction =>
  makeAnalyticsAction(
    'analytics/generatedAnswer/openAnswerSource',
    AnalyticsType.Custom,
    (client, state) => {
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
    }
  );

export const logLikeGeneratedAnswer = (): CustomAction =>
  makeAnalyticsAction(
    'analytics/generatedAnswer/like',
    AnalyticsType.Custom,
    (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.makeLikeGeneratedAnswer({
        generativeQuestionAnsweringId,
      });
    }
  );

export const logDislikeGeneratedAnswer = (): CustomAction =>
  makeAnalyticsAction(
    'analytics/generatedAnswer/dislike',
    AnalyticsType.Custom,
    (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.makeDislikeGeneratedAnswer({
        generativeQuestionAnsweringId,
      });
    }
  );

export const logGeneratedAnswerFeedback = (
  feedback: GeneratedAnswerFeedback
): CustomAction =>
  makeAnalyticsAction(
    'analytics/generatedAnswer/sendFeedback',
    AnalyticsType.Custom,
    (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.makeGeneratedAnswerFeedbackSubmit({
        generativeQuestionAnsweringId,
        reason: feedback,
      });
    }
  );

export const logGeneratedAnswerDetailedFeedback = (
  details: string
): CustomAction =>
  makeAnalyticsAction(
    'analytics/generatedAnswer/sendFeedback',
    AnalyticsType.Custom,
    (client, state) => {
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
    }
  );

export const logGeneratedAnswerStreamEnd = (
  answerGenerated: boolean
): CustomAction =>
  makeAnalyticsAction(
    'analytics/generatedAnswer/streamEnd',
    AnalyticsType.Custom,
    (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.makeGeneratedAnswerStreamEnd({
        generativeQuestionAnsweringId,
        answerGenerated,
      });
    }
  );

export const logGeneratedAnswerShowAnswers = (): CustomAction =>
  makeAnalyticsAction(
    'analytics/generatedAnswer/show',
    AnalyticsType.Custom,
    (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.makeGeneratedAnswerShowAnswers({
        generativeQuestionAnsweringId,
      });
    }
  );

export const logGeneratedAnswerHideAnswers = (): CustomAction =>
  makeAnalyticsAction(
    'analytics/generatedAnswer/hide',
    AnalyticsType.Custom,
    (client, state) => {
      const generativeQuestionAnsweringId =
        generativeQuestionAnsweringIdSelector(state);
      if (!generativeQuestionAnsweringId) {
        return null;
      }
      return client.makeGeneratedAnswerHideAnswers({
        generativeQuestionAnsweringId,
      });
    }
  );
