import {validatePayload} from '../../utils/validate-payload';
import {
  ClickAction,
  CustomAction,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
} from '../analytics/analytics-utils';
import {
  inlineLinkPayloadDefinition,
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
  makeAnalyticsAction('analytics/smartSnippet/expand', (client) =>
    client.makeExpandSmartSnippet()
  );

export const logCollapseSmartSnippet = (): CustomAction =>
  makeAnalyticsAction('analytics/smartSnippet/collapse', (client) =>
    client.makeCollapseSmartSnippet()
  );

export const logLikeSmartSnippet = (): CustomAction =>
  makeAnalyticsAction('analytics/smartSnippet/like', (client) =>
    client.makeLikeSmartSnippet()
  );

export const logDislikeSmartSnippet = (): CustomAction =>
  makeAnalyticsAction('analytics/smartSnippet/dislike', (client) =>
    client.makeDislikeSmartSnippet()
  );

/**
 * @returns A dispatchable action.
 */
export function logOpenSmartSnippetSource(): ClickAction {
  return makeAnalyticsAction(
    'analytics/smartSnippet/source/open',
    (client, state) => {
      const result = answerSourceSelector(state)!;
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
  makeAnalyticsAction('analytics/smartSnippet/source/open', (client, state) => {
    validatePayload(payload, inlineLinkPayloadDefinition());
    const result = answerSourceSelector(state)!;
    return client.makeOpenSmartSnippetInlineLink(
      partialDocumentInformation(result, state),
      {
        ...documentIdentifier(result),
        ...payload,
      }
    );
  });

export const logOpenSmartSnippetFeedbackModal = (): CustomAction =>
  makeAnalyticsAction('analytics/smartSnippet/feedbackModal/open', (client) =>
    client.makeOpenSmartSnippetFeedbackModal()
  );

export const logCloseSmartSnippetFeedbackModal = (): CustomAction =>
  makeAnalyticsAction('analytics/smartSnippet/feedbackModal/close', (client) =>
    client.makeCloseSmartSnippetFeedbackModal()
  );

export const logSmartSnippetFeedback = (
  feedback: SmartSnippetFeedback
): CustomAction =>
  makeAnalyticsAction('analytics/smartSnippet/sendFeedback', (client) =>
    client.makeSmartSnippetFeedbackReason(feedback)
  );

export const logSmartSnippetDetailedFeedback = (
  details: string
): CustomAction =>
  makeAnalyticsAction('analytics/smartSnippet/sendFeedback', (client) =>
    client.makeSmartSnippetFeedbackReason('other', details)
  );

export const logExpandSmartSnippetSuggestion = (
  payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
): CustomAction =>
  makeAnalyticsAction(
    'analytics/smartSnippetSuggestion/expand',
    (client, state) => {
      validateQuestionAnsweringActionCreatorPayload(payload);

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
  payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
): CustomAction =>
  makeAnalyticsAction(
    'analytics/smartSnippetSuggestion/expand',
    (client, state) => {
      validateQuestionAnsweringActionCreatorPayload(payload);

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
  makeAnalyticsAction('analytics/smartSnippet/source/open', (client, state) => {
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
  });

export const logOpenSmartSnippetSuggestionInlineLink = (
  identifier: QuestionAnsweringUniqueIdentifierActionCreatorPayload,
  link: QuestionAnsweringInlineLinkActionCreatorPayload
): ClickAction =>
  makeAnalyticsAction('analytics/smartSnippet/source/open', (client, state) => {
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
  });

export const smartSnippetAnalyticsClient = {
  logExpandSmartSnippet,
  logCollapseSmartSnippet,
  logLikeSmartSnippet,
  logDislikeSmartSnippet,
  logOpenSmartSnippetSource,
  logOpenSmartSnippetInlineLink,
  logOpenSmartSnippetFeedbackModal,
  logCloseSmartSnippetFeedbackModal,
  logSmartSnippetFeedback,
  logSmartSnippetDetailedFeedback,
  logExpandSmartSnippetSuggestion,
  logCollapseSmartSnippetSuggestion,
  logOpenSmartSnippetSuggestionSource,
};
