import {Qna} from '@coveo/relay-event-types';
import {validatePayload} from '../../utils/validate-payload.js';
import {
  ClickAction,
  CustomAction,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
} from '../analytics/analytics-utils.js';
import {
  inlineLinkPayloadDefinition,
  QuestionAnsweringInlineLinkActionCreatorPayload,
  QuestionAnsweringUniqueIdentifierActionCreatorPayload,
  uniqueIdentifierPayloadDefinition,
  validateQuestionAnsweringActionCreatorPayload,
} from './question-answering-document-id.js';
import {
  answerSourceSelector,
  relatedQuestionSelector,
} from './question-answering-selectors.js';

export type SmartSnippetFeedback =
  | 'does_not_answer'
  | 'partially_answers'
  | 'was_not_a_question';

export const logExpandSmartSnippet = (): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/smartSnippet/expand',
    __legacy__getBuilder: (client) => {
      return client.makeExpandSmartSnippet();
    },
    analyticsType: 'Qna.AnswerAction',
    analyticsPayloadBuilder: (state): Qna.AnswerAction => {
      return {
        action: 'expand',
        answer: {
          responseId: state.search?.response.searchUid || '',
          type: 'SmartSnippet',
        },
      };
    },
  });

export const logCollapseSmartSnippet = (): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/smartSnippet/collapse',
    __legacy__getBuilder: (client) => {
      return client.makeCollapseSmartSnippet();
    },
    analyticsType: 'Qna.AnswerAction',
    analyticsPayloadBuilder: (state): Qna.AnswerAction => {
      return {
        action: 'collapse',
        answer: {
          responseId: state.search?.response.searchUid || '',
          type: 'SmartSnippet',
        },
      };
    },
  });

export const logLikeSmartSnippet = (): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/smartSnippet/like',
    __legacy__getBuilder: (client) => {
      return client.makeLikeSmartSnippet();
    },
    analyticsType: 'Qna.AnswerAction',
    analyticsPayloadBuilder: (state): Qna.AnswerAction => {
      return {
        action: 'like',
        answer: {
          responseId: state.search?.response.searchUid || '',
          type: 'SmartSnippet',
        },
      };
    },
  });

export const logDislikeSmartSnippet = (): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/smartSnippet/dislike',
    __legacy__getBuilder: (client) => {
      return client.makeDislikeSmartSnippet();
    },
    analyticsType: 'Qna.AnswerAction',
    analyticsPayloadBuilder: (state): Qna.AnswerAction => {
      return {
        action: 'dislike',
        answer: {
          responseId: state.search?.response.searchUid || '',
          type: 'SmartSnippet',
        },
      };
    },
  });

/**
 * @returns A dispatchable action.
 */
export const logOpenSmartSnippetSource = (): ClickAction =>
  makeAnalyticsAction({
    prefix: 'analytics/smartSnippet/source/open',
    __legacy__getBuilder: (client, state) => {
      const result = answerSourceSelector(state)!;
      return client.makeOpenSmartSnippetSource(
        partialDocumentInformation(result, state),
        documentIdentifier(result)
      );
    },
    analyticsType: 'Qna.CitationClick',
    analyticsPayloadBuilder: (state): Qna.CitationClick => {
      const result = answerSourceSelector(state)!;
      const identifier = documentIdentifier(result);
      return {
        answer: {
          responseId: state.search?.response.searchUid || '',
          type: 'SmartSnippet',
        },
        citation: {
          id: identifier.contentIDValue,
          type: 'Source',
        },
      };
    },
  });

export const logOpenSmartSnippetInlineLink = (
  payload: QuestionAnsweringInlineLinkActionCreatorPayload
): ClickAction =>
  makeAnalyticsAction({
    prefix: 'analytics/smartSnippet/source/open',
    __legacy__getBuilder: (client, state) => {
      validatePayload(payload, inlineLinkPayloadDefinition());
      const result = answerSourceSelector(state);
      if (!result) {
        return null;
      }
      return client.makeOpenSmartSnippetInlineLink(
        partialDocumentInformation(result, state),
        {
          ...documentIdentifier(result),
          ...payload,
        }
      );
    },
    analyticsType: 'Qna.CitationClick',
    analyticsPayloadBuilder: (state): Qna.CitationClick => {
      const result = answerSourceSelector(state)!;
      const identifier = documentIdentifier(result);
      return {
        answer: {
          responseId: state.search?.response.searchUid || '',
          type: 'SmartSnippet',
        },
        citation: {
          id: identifier.contentIDValue,
          type: 'InlineLink',
        },
      };
    },
  });

//TODO: SFINT-5435
export const logOpenSmartSnippetFeedbackModal = (): CustomAction =>
  makeAnalyticsAction('analytics/smartSnippet/feedbackModal/open', (client) =>
    client.makeOpenSmartSnippetFeedbackModal()
  );

//TODO: SFINT-5435
export const logCloseSmartSnippetFeedbackModal = (): CustomAction =>
  makeAnalyticsAction('analytics/smartSnippet/feedbackModal/close', (client) =>
    client.makeCloseSmartSnippetFeedbackModal()
  );

export const logSmartSnippetFeedback = (
  feedback: SmartSnippetFeedback
): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/smartSnippet/sendFeedback',
    __legacy__getBuilder: (client) => {
      return client.makeSmartSnippetFeedbackReason(feedback);
    },
    analyticsType: 'Qna.SubmitSmartSnippetFeedback',
    analyticsPayloadBuilder: (state): Qna.SubmitSmartSnippetFeedback => {
      return {
        answer: {
          responseId: state.search?.response.searchUid || '',
        },
        feedback: {
          reason:
            feedback as Qna.SubmitSmartSnippetFeedback['feedback']['reason'],
        },
      };
    },
  });

export const logSmartSnippetDetailedFeedback = (
  details: string
): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/smartSnippet/sendFeedback',
    __legacy__getBuilder: (client) => {
      return client.makeSmartSnippetFeedbackReason('other', details);
    },
    analyticsType: 'Qna.SubmitSmartSnippetFeedback',
    analyticsPayloadBuilder: (state): Qna.SubmitSmartSnippetFeedback => {
      return {
        answer: {
          responseId: state.search?.response.searchUid || '',
        },
        feedback: {
          reason: 'other',
          details: details,
        },
      };
    },
  });

export const logExpandSmartSnippetSuggestion = (
  payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/smartSnippetSuggestion/expand',
    __legacy__getBuilder: (client, state) => {
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
    },
    analyticsType: 'Qna.AnswerAction',
    analyticsPayloadBuilder: (state): Qna.AnswerAction => {
      return {
        action: 'expand',
        answer: {
          responseId: state.search?.response.searchUid || '',
          type: 'SmartSnippetSuggestion',
        },
      };
    },
  });

export const logCollapseSmartSnippetSuggestion = (
  payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/smartSnippetSuggestion/collapse',
    __legacy__getBuilder: (client, state) => {
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
    },
    analyticsType: 'Qna.AnswerAction',
    analyticsPayloadBuilder: (state): Qna.AnswerAction => {
      return {
        action: 'collapse',
        answer: {
          responseId: state.search?.response.searchUid || '',
          type: 'SmartSnippetSuggestion',
        },
      };
    },
  });

export const logOpenSmartSnippetSuggestionSource = (
  payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
): ClickAction =>
  makeAnalyticsAction({
    prefix: 'analytics/smartSnippetSuggestion/source/open',
    __legacy__getBuilder: (client, state) => {
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
    },
    analyticsType: 'Qna.CitationClick',
    analyticsPayloadBuilder: (state): Qna.CitationClick => {
      const relatedQuestion = relatedQuestionSelector(
        state,
        payload.questionAnswerId
      );
      return {
        answer: {
          responseId: state.search?.response.searchUid || '',
          type: 'SmartSnippetSuggestion',
        },
        citation: {
          id: relatedQuestion?.documentId.contentIdValue || '',
          type: 'Source',
        },
      };
    },
  });

export const logOpenSmartSnippetSuggestionInlineLink = (
  identifier: QuestionAnsweringUniqueIdentifierActionCreatorPayload,
  link: QuestionAnsweringInlineLinkActionCreatorPayload
): ClickAction =>
  makeAnalyticsAction({
    prefix: 'analytics/smartSnippetSuggestion/source/open',
    __legacy__getBuilder: (client, state) => {
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
    },
    analyticsType: 'Qna.CitationClick',
    analyticsPayloadBuilder: (state): Qna.CitationClick => {
      const relatedQuestion = relatedQuestionSelector(
        state,
        identifier.questionAnswerId
      );
      return {
        answer: {
          responseId: state.search?.response.searchUid || '',
          type: 'SmartSnippetSuggestion',
        },
        citation: {
          id: relatedQuestion?.documentId.contentIdValue || '',
          type: 'InlineLink',
        },
      };
    },
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
