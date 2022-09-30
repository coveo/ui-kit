import {Result} from '../../api/search/search/result';
import {validatePayload} from '../../utils/validate-payload';
import {
  AnalyticsType,
  ClickAction,
  CustomAction,
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

export const logExpandSmartSnippet = (): CustomAction =>
  makeAnalyticsAction(
    'analytics/smartSnippet/expand',
    AnalyticsType.Custom,
    (client) => client.makeExpandSmartSnippet()
  );

export const logCollapseSmartSnippet = (): CustomAction =>
  makeAnalyticsAction(
    'analytics/smartSnippet/collapse',
    AnalyticsType.Custom,
    (client) => client.makeCollapseSmartSnippet()
  );

export const logLikeSmartSnippet = (): CustomAction =>
  makeAnalyticsAction(
    'analytics/smartSnippet/like',
    AnalyticsType.Custom,
    (client) => client.makeLikeSmartSnippet()
  );

export const logDislikeSmartSnippet = (): CustomAction =>
  makeAnalyticsAction(
    'analytics/smartSnippet/dislike',
    AnalyticsType.Custom,
    (client) => client.makeDislikeSmartSnippet()
  );

/**
 * @returns A dispatchable action.
 * @deprecated Providing a source is no longer necessary.
 * */
export function logOpenSmartSnippetSource(source: Result): ClickAction;
/**
 * @returns A dispatchable action.
 */
export function logOpenSmartSnippetSource(): ClickAction;
export function logOpenSmartSnippetSource(source?: Result): ClickAction {
  return makeAnalyticsAction(
    'analytics/smartSnippet/source/open',
    AnalyticsType.Click,
    (client, state) => {
      if (source) {
        validateResultPayload(source);
      }
      const result = source ?? answerSourceSelector(state)!;
      return client.makeOpenSmartSnippetSource(
        partialDocumentInformation(result, state),
        documentIdentifier(result)
      );
    }
  );
}

export const logOpenSmartSnippetInlineLink = (
  payload: QuestionAnsweringInlineLinkActionCreatorPayload
): ClickAction =>
  makeAnalyticsAction(
    'analytics/smartSnippet/source/open',
    AnalyticsType.Click,
    (client, state) => {
      validatePayload(payload, inlineLinkPayloadDefinition());
      const result = answerSourceSelector(state)!;
      return client.makeOpenSmartSnippetInlineLink(
        partialDocumentInformation(result, state),
        {
          ...documentIdentifier(result),
          ...payload,
        }
      );
    }
  );

export const logOpenSmartSnippetFeedbackModal = (): CustomAction =>
  makeAnalyticsAction(
    'analytics/smartSnippet/feedbackModal/open',
    AnalyticsType.Custom,
    (client) => client.makeOpenSmartSnippetFeedbackModal()
  );

export const logCloseSmartSnippetFeedbackModal = (): CustomAction =>
  makeAnalyticsAction(
    'analytics/smartSnippet/feedbackModal/close',
    AnalyticsType.Custom,
    (client) => client.makeCloseSmartSnippetFeedbackModal()
  );

export const logSmartSnippetFeedback = (
  feedback: SmartSnippetFeedback
): CustomAction =>
  makeAnalyticsAction(
    'analytics/smartSnippet/sendFeedback',
    AnalyticsType.Custom,
    (client) => client.makeSmartSnippetFeedbackReason(feedback)
  );

export const logSmartSnippetDetailedFeedback = (
  details: string
): CustomAction =>
  makeAnalyticsAction(
    'analytics/smartSnippet/sendFeedback',
    AnalyticsType.Custom,
    (client) => client.makeSmartSnippetFeedbackReason('other', details)
  );

export const logExpandSmartSnippetSuggestion = (
  payload:
    | QuestionAnsweringUniqueIdentifierActionCreatorPayload
    | QuestionAnsweringDocumentIdActionCreatorPayload
): CustomAction =>
  makeAnalyticsAction(
    'analytics/smartSnippetSuggestion/expand',
    AnalyticsType.Custom,
    (client, state) => {
      validateQuestionAnsweringActionCreatorPayload(payload);

      if (!isQuestionAnsweringUniqueIdentifierActionCreatorPayload(payload)) {
        return client.makeExpandSmartSnippetSuggestion(payload);
      }

      const relatedQuestion = relatedQuestionSelector(
        state,
        payload.questionAnswerId
      );
      if (!relatedQuestion) {
        return null;
      }

      return client.makeExpandSmartSnippetSuggestion({
        question: relatedQuestion.question,
        answerSnippet: relatedQuestion.answerSnippet,
        documentId: relatedQuestion.documentId,
      });
    }
  );

export const logCollapseSmartSnippetSuggestion = (
  payload:
    | QuestionAnsweringUniqueIdentifierActionCreatorPayload
    | QuestionAnsweringDocumentIdActionCreatorPayload
): CustomAction =>
  makeAnalyticsAction(
    'analytics/smartSnippetSuggestion/expand',
    AnalyticsType.Custom,
    (client, state) => {
      validateQuestionAnsweringActionCreatorPayload(payload);

      if (!isQuestionAnsweringUniqueIdentifierActionCreatorPayload(payload)) {
        return client.makeCollapseSmartSnippetSuggestion(payload);
      }

      const relatedQuestion = relatedQuestionSelector(
        state,
        payload.questionAnswerId
      );
      if (!relatedQuestion) {
        return null;
      }

      return client.makeCollapseSmartSnippetSuggestion({
        question: relatedQuestion.question,
        answerSnippet: relatedQuestion.answerSnippet,
        documentId: relatedQuestion.documentId,
      });
    }
  );

export const logOpenSmartSnippetSuggestionSource = (
  payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
): ClickAction =>
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
        return null;
      }
      const source = answerSourceSelector(state, relatedQuestion.documentId);
      if (!source) {
        return null;
      }

      return client.makeOpenSmartSnippetSuggestionSource(
        partialDocumentInformation(source, state),
        {
          question: relatedQuestion.question,
          answerSnippet: relatedQuestion.answerSnippet,
          documentId: relatedQuestion.documentId,
        }
      );
    }
  );

export const logOpenSmartSnippetSuggestionInlineLink = (
  identifier: QuestionAnsweringUniqueIdentifierActionCreatorPayload,
  link: QuestionAnsweringInlineLinkActionCreatorPayload
): ClickAction =>
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
        return null;
      }
      const source = answerSourceSelector(state, relatedQuestion.documentId);
      if (!source) {
        return null;
      }

      return client.makeOpenSmartSnippetSuggestionInlineLink(
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
  );
