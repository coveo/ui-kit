import {AsyncThunkAction} from '@reduxjs/toolkit';
import {StateNeededBySearchAnalyticsProvider} from '../../api/analytics/search-analytics';
import {Result} from '../../api/search/search/result';
import {validatePayload} from '../../utils/validate-payload';
import {
  AnalyticsType,
  AsyncThunkAnalyticsOptions,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';
import {
  inlineLinkPayloadDefinition,
  isQuestionAnsweringUniqueIdentifierActionCreatorPayload,
  QuestionAnsweringDocumentIdActionCreatorPayload,
  QuestionAnsweringInlineLinkActionCreatorPayload,
  QuestionAnsweringUniqueIdentifierActionCreatorPayload,
  uniqueIdentifierPayloadDefinition,
  validateQuestionAnsweringActionCreatorPayload,
} from './question-answering-document-id';
import {
  answerSourceSelector,
  relatedQuestionSelector,
} from './question-answering-selectors';

export type SmartSnippetFeedback =
  | 'does_not_answer'
  | 'partially_answers'
  | 'was_not_a_question';

export const logExpandSmartSnippet = makeAnalyticsAction(
  'analytics/smartSnippet/expand',
  AnalyticsType.Custom,
  (client) => client.logExpandSmartSnippet()
);

export const logCollapseSmartSnippet = makeAnalyticsAction(
  'analytics/smartSnippet/collapse',
  AnalyticsType.Custom,
  (client) => client.logCollapseSmartSnippet()
);

export const logLikeSmartSnippet = makeAnalyticsAction(
  'analytics/smartSnippet/like',
  AnalyticsType.Custom,
  (client) => client.logLikeSmartSnippet()
);

export const logDislikeSmartSnippet = makeAnalyticsAction(
  'analytics/smartSnippet/dislike',
  AnalyticsType.Custom,
  (client) => client.logDislikeSmartSnippet()
);

/**
 * @returns A dispatchable action.
 * @deprecated
 * */
export function logOpenSmartSnippetSource(source: Result): AsyncThunkAction<
  {
    analyticsType: AnalyticsType.Click;
  },
  void,
  AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
>;
/**
 * @returns A dispatchable action.
 */
export function logOpenSmartSnippetSource(): AsyncThunkAction<
  {
    analyticsType: AnalyticsType.Click;
  },
  void,
  AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
>;
export function logOpenSmartSnippetSource(source?: Result) {
  return makeAnalyticsAction(
    'analytics/smartSnippet/source/open',
    AnalyticsType.Click,
    (client, state) => {
      if (source) {
        validateResultPayload(source);
      }
      const result = source ?? answerSourceSelector(state)!;
      return client.logOpenSmartSnippetSource(
        partialDocumentInformation(result, state),
        documentIdentifier(result)
      );
    }
  )();
}

export const logOpenSmartSnippetInlineLink = (
  payload: QuestionAnsweringInlineLinkActionCreatorPayload
) =>
  makeAnalyticsAction(
    'analytics/smartSnippet/source/open',
    AnalyticsType.Click,
    (client, state) => {
      validatePayload(payload, inlineLinkPayloadDefinition());
      const result = answerSourceSelector(state)!;
      return client.logOpenSmartSnippetInlineLink(
        partialDocumentInformation(result, state),
        {
          ...documentIdentifier(result),
          ...payload,
        }
      );
    }
  )();

export const logOpenSmartSnippetFeedbackModal = makeAnalyticsAction(
  'analytics/smartSnippet/feedbackModal/open',
  AnalyticsType.Custom,
  (client) => client.logOpenSmartSnippetFeedbackModal()
);

export const logCloseSmartSnippetFeedbackModal = makeAnalyticsAction(
  'analytics/smartSnippet/feedbackModal/close',
  AnalyticsType.Custom,
  (client) => client.logCloseSmartSnippetFeedbackModal()
);

export const logSmartSnippetFeedback = (feedback: SmartSnippetFeedback) =>
  makeAnalyticsAction(
    'analytics/smartSnippet/sendFeedback',
    AnalyticsType.Custom,
    (client) => client.logSmartSnippetFeedbackReason(feedback)
  )();

export const logSmartSnippetDetailedFeedback = (details: string) =>
  makeAnalyticsAction(
    'analytics/smartSnippet/sendFeedback',
    AnalyticsType.Custom,
    (client) => client.logSmartSnippetFeedbackReason('other', details)
  )();

export const logExpandSmartSnippetSuggestion = (
  payload:
    | QuestionAnsweringUniqueIdentifierActionCreatorPayload
    | QuestionAnsweringDocumentIdActionCreatorPayload
) =>
  makeAnalyticsAction(
    'analytics/smartSnippetSuggestion/expand',
    AnalyticsType.Custom,
    (client, state) => {
      validateQuestionAnsweringActionCreatorPayload(payload);

      if (!isQuestionAnsweringUniqueIdentifierActionCreatorPayload(payload)) {
        return client.logExpandSmartSnippetSuggestion(payload);
      }

      const relatedQuestion = relatedQuestionSelector(
        state,
        payload.questionAnswerId
      );
      if (!relatedQuestion) {
        return;
      }

      return client.logExpandSmartSnippetSuggestion({
        question: relatedQuestion.question,
        answerSnippet: relatedQuestion.answerSnippet,
        documentId: relatedQuestion.documentId,
      });
    }
  )();

export const logCollapseSmartSnippetSuggestion = (
  payload:
    | QuestionAnsweringUniqueIdentifierActionCreatorPayload
    | QuestionAnsweringDocumentIdActionCreatorPayload
) =>
  makeAnalyticsAction(
    'analytics/smartSnippetSuggestion/expand',
    AnalyticsType.Custom,
    (client, state) => {
      validateQuestionAnsweringActionCreatorPayload(payload);

      if (!isQuestionAnsweringUniqueIdentifierActionCreatorPayload(payload)) {
        return client.logCollapseSmartSnippetSuggestion(payload);
      }

      const relatedQuestion = relatedQuestionSelector(
        state,
        payload.questionAnswerId
      );
      if (!relatedQuestion) {
        return;
      }

      return client.logCollapseSmartSnippetSuggestion({
        question: relatedQuestion.question,
        answerSnippet: relatedQuestion.answerSnippet,
        documentId: relatedQuestion.documentId,
      });
    }
  )();

export const logOpenSmartSnippetSuggestionSource = (
  payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
) =>
  makeAnalyticsAction(
    'analytics/smartSnippet/source/open',
    AnalyticsType.Click,
    (client, state) => {
      validatePayload(payload, uniqueIdentifierPayloadDefinition());

      const relatedQuestion = relatedQuestionSelector(
        state,
        payload.questionAnswerId
      );
      if (!relatedQuestion) {
        return;
      }
      const source = answerSourceSelector(state, relatedQuestion.documentId);
      if (!source) {
        return;
      }

      return client.logOpenSmartSnippetSuggestionSource(
        partialDocumentInformation(source, state),
        {
          question: relatedQuestion.question,
          answerSnippet: relatedQuestion.answerSnippet,
          documentId: relatedQuestion.documentId,
        }
      );
    }
  )();

export const logOpenSmartSnippetSuggestionInlineLink = (
  identifier: QuestionAnsweringUniqueIdentifierActionCreatorPayload,
  link: QuestionAnsweringInlineLinkActionCreatorPayload
) =>
  makeAnalyticsAction(
    'analytics/smartSnippet/source/open',
    AnalyticsType.Click,
    (client, state) => {
      validatePayload(identifier, uniqueIdentifierPayloadDefinition());
      validatePayload(link, inlineLinkPayloadDefinition());

      const relatedQuestion = relatedQuestionSelector(
        state,
        identifier.questionAnswerId
      );
      if (!relatedQuestion) {
        return;
      }
      const source = answerSourceSelector(state, relatedQuestion.documentId);
      if (!source) {
        return;
      }

      return client.logOpenSmartSnippetSuggestionInlineLink(
        partialDocumentInformation(source, state),
        {
          question: relatedQuestion.question,
          answerSnippet: relatedQuestion.answerSnippet,
          documentId: relatedQuestion.documentId,
          linkText: link.linkText,
          linkURL: link.linkURL,
        }
      );
    }
  )();
