import {Result} from '../../api/search/search/result';
import {
  AnalyticsType,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';
import {
  isQuestionAnsweringUniqueIdentifierActionCreatorPayload,
  QuestionAnsweringDocumentIdActionCreatorPayload,
  QuestionAnsweringUniqueIdentifierActionCreatorPayload,
  validateQuestionAnsweringActionCreatorPayload,
} from './question-answering-document-id';
import {relatedQuestionSelector} from './question-answering-selectors';

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

export const logOpenSmartSnippetSource = (source: Result) =>
  makeAnalyticsAction(
    'analytics/smartSnippet/source/open',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(source);
      return client.logOpenSmartSnippetSource(
        partialDocumentInformation(source, state),
        documentIdentifier(source)
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
