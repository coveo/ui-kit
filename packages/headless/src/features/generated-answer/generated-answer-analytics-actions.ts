import {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload';
import {
  AnalyticsType,
  CustomAction,
  SearchAction,
  makeAnalyticsAction,
} from '../analytics/analytics-utils';

export const logRetryGeneratedAnswer = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/generatedAnswer/retry',
    AnalyticsType.Search,
    (client) => client.makeRetryGeneratedAnswer()
  );

export const logOpenGeneratedAnswerSource = (
  citation: GeneratedAnswerCitation
): CustomAction =>
  makeAnalyticsAction(
    'analytics/generatedAnswer/openSource',
    AnalyticsType.Custom,
    (client, state) => {
      const generativeQuestionAnsweringId =
        state.search?.response?.extendedResults
          ?.generativeQuestionAnsweringId ?? '';
      return client.makeOpenGeneratedAnswerSource({
        generativeQuestionAnsweringId,
        permanentId: citation.permanentid,
        id: citation.id,
      });
    }
  );

export const logLikeGeneratedAnswer = (): CustomAction =>
  makeAnalyticsAction(
    'analytics/generatedAnswer/like',
    AnalyticsType.Custom,
    (client, state) => {
      const generativeQuestionAnsweringId =
        state.search?.response?.extendedResults
          ?.generativeQuestionAnsweringId ?? '';
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
        state.search?.response?.extendedResults
          ?.generativeQuestionAnsweringId ?? '';
      return client.makeDislikeGeneratedAnswer({
        generativeQuestionAnsweringId,
      });
    }
  );
