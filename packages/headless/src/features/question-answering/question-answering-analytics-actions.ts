import {Qna, ItemClick, Feedback} from '@coveo/relay-event-types';
import {validatePayload} from '../../utils/validate-payload';
import {
  ClickAction,
  CustomAction,
  analyticsEventItemMetadata,
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
          id: state.questionAnswering?.questionAnswerId || '',
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
          id: state.questionAnswering?.questionAnswerId || '',
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
    analyticsType: 'Qna.SubmitFeedback',
    analyticsPayloadBuilder: (state): Qna.SubmitFeedback => {
      return {
        answer: {
          id: state.questionAnswering?.questionAnswerId || '',
          type: 'SmartSnippet',
        },
        feedback: {
          liked: true,
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
    analyticsType: 'Qna.SubmitFeedback',
    analyticsPayloadBuilder: (state): Qna.SubmitFeedback => {
      return {
        answer: {
          id: state.questionAnswering?.questionAnswerId || '',
          type: 'SmartSnippet',
        },
        feedback: {
          liked: false,
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
    analyticsType: 'ItemClick',
    analyticsPayloadBuilder: (state): ItemClick => {
      const result = answerSourceSelector(state)!;
      const information = partialDocumentInformation(result, state);
      return {
        searchUid: state.search?.response.searchUid ?? '',
        position: information.documentPosition,
        itemMetadata: analyticsEventItemMetadata(result, state),
      };
    },
  });

//TODO: SFINT-5435
export const logOpenSmartSnippetInlineLink = (
  payload: QuestionAnsweringInlineLinkActionCreatorPayload
): ClickAction =>
  makeAnalyticsAction('analytics/smartSnippet/source/open', (client, state) => {
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
    analyticsType: 'Qna.SubmitFeedback',
    analyticsPayloadBuilder: (state): Qna.SubmitFeedback => {
      return {
        answer: {
          id: state.questionAnswering?.questionAnswerId || '',
          type: 'SmartSnippet',
        },
        feedback: {
          liked: true,
          reason: feedback as Feedback['reason'],
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
    analyticsType: 'Qna.SubmitFeedback',
    analyticsPayloadBuilder: (state): Qna.SubmitFeedback => {
      return {
        answer: {
          id: state.questionAnswering?.questionAnswerId || '',
          type: 'SmartSnippet',
        },
        feedback: {
          liked: true,
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
    analyticsPayloadBuilder: (): Qna.AnswerAction => {
      return {
        action: 'expand',
        answer: {
          id: payload.questionAnswerId,
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
    analyticsPayloadBuilder: (): Qna.AnswerAction => {
      return {
        action: 'collapse',
        answer: {
          id: payload.questionAnswerId,
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
    analyticsType: 'ItemClick',
    analyticsPayloadBuilder: (state): ItemClick => {
      const relatedQuestion = relatedQuestionSelector(
        state,
        payload.questionAnswerId
      );
      const result = answerSourceSelector(state, relatedQuestion?.documentId)!;
      const information = partialDocumentInformation(result, state);
      return {
        searchUid: state.search?.response.searchUid ?? '',
        position: information.documentPosition,
        itemMetadata: analyticsEventItemMetadata(result, state),
      };
    },
  });

//TODO: SFINT-5435
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
