/*import {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload';
import {
  AnalyticsType,
  ClickAction,
  CustomAction,
  SearchAction,
  makeAnalyticsAction,
} from '../analytics/analytics-utils';

export const logRetryGeneratedAnswer = (): SearchAction =>
  makeAnalyticsAction(
    'generatedAnswer/logRetryGeneratedAnswer',
    AnalyticsType.Search,
    (client) => client.logRetryGeneratedAnswer()
  );

export const logOpenGeneratedAnswerSource = (
  result: GeneratedAnswerCitation
): ClickAction =>
  makeAnalyticsAction(
    'generatedAnswer/logOpenGeneratedAnswerSource',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(result);
      return client.logOpenGeneratedAnswerSource(
        partialDocumentInformation(result, state),
        documentIdentifier(result)
      );
    }
  );

export const logLikeGeneratedAnswer = (): CustomAction =>
  makeAnalyticsAction(
    'generatedAnswer/logLikeGeneratedAnswer',
    AnalyticsType.Custom,
    (client, state) => {
      const generativeQuestionAnsweringId =
        state.search?.response?.extendedResults?.generativeQuestionAnsweringId;
      return client.logLikeGeneratedAnswer({
        generativeQuestionAnsweringId,
      });
    }
  );

export const logDislikeGeneratedAnswer = (): CustomAction =>
  makeAnalyticsAction(
    'generatedAnswer/logDislikeGeneratedAnswer',
    AnalyticsType.Custom,
    (client, state) => {
      const generativeQuestionAnsweringId =
        state.search?.response?.extendedResults?.generativeQuestionAnsweringId;
      return client.logDislikeGeneratedAnswer({
        generativeQuestionAnsweringId,
      });
    }
  );
*/
export {};
