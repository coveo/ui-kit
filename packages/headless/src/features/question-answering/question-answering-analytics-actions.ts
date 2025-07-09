import type {SmartSnippets} from '@coveo/relay-event-types';
import {validatePayload} from '../../utils/validate-payload.js';
import {
  type ClickAction,
  type CustomAction,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
} from '../analytics/analytics-utils.js';
import {
  inlineLinkPayloadDefinition,
  type QuestionAnsweringInlineLinkActionCreatorPayload,
  type QuestionAnsweringUniqueIdentifierActionCreatorPayload,
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
    analyticsType: 'SmartSnippets.AnswerAction',
    analyticsPayloadBuilder: (
      state
    ): SmartSnippets.AnswerAction | undefined => {
      const result = answerSourceSelector(state)!;
      const identifier = documentIdentifier(result);

      const searchUid = state.search?.response.searchUid;
      if (searchUid) {
        return {
          action: 'expand',
          snippetType: 'SmartSnippet',
          responseId: searchUid,
          itemMetadata: {
            uniqueFieldName: identifier.contentIDKey,
            uniqueFieldValue: identifier.contentIDValue,
            title: result.title,
            url: result.clickUri,
          },
        };
      }
    },
  });

export const logCollapseSmartSnippet = (): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/smartSnippet/collapse',
    __legacy__getBuilder: (client) => {
      return client.makeCollapseSmartSnippet();
    },
    analyticsType: 'SmartSnippets.AnswerAction',
    analyticsPayloadBuilder: (
      state
    ): SmartSnippets.AnswerAction | undefined => {
      const result = answerSourceSelector(state)!;
      const identifier = documentIdentifier(result);

      const searchUid = state.search?.response.searchUid;
      if (searchUid) {
        return {
          action: 'collapse',
          snippetType: 'SmartSnippet',
          responseId: searchUid,
          itemMetadata: {
            uniqueFieldName: identifier.contentIDKey,
            uniqueFieldValue: identifier.contentIDValue,
            title: result.title,
            url: result.clickUri,
          },
        };
      }
    },
  });

export const logLikeSmartSnippet = (): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/smartSnippet/like',
    __legacy__getBuilder: (client) => {
      return client.makeLikeSmartSnippet();
    },
    analyticsType: 'SmartSnippets.AnswerAction',
    analyticsPayloadBuilder: (
      state
    ): SmartSnippets.AnswerAction | undefined => {
      const result = answerSourceSelector(state)!;
      const identifier = documentIdentifier(result);

      const searchUid = state.search?.response.searchUid;
      if (searchUid) {
        return {
          action: 'like',
          snippetType: 'SmartSnippet',
          responseId: searchUid,
          itemMetadata: {
            uniqueFieldName: identifier.contentIDKey,
            uniqueFieldValue: identifier.contentIDValue,
            title: result.title,
            url: result.clickUri,
          },
        };
      }
    },
  });

export const logDislikeSmartSnippet = (): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/smartSnippet/dislike',
    __legacy__getBuilder: (client) => {
      return client.makeDislikeSmartSnippet();
    },
    analyticsType: 'SmartSnippets.AnswerAction',
    analyticsPayloadBuilder: (
      state
    ): SmartSnippets.AnswerAction | undefined => {
      const result = answerSourceSelector(state)!;
      const identifier = documentIdentifier(result);
      const searchUid = state.search?.response.searchUid;
      if (searchUid) {
        return {
          action: 'dislike',
          snippetType: 'SmartSnippet',
          responseId: searchUid,
          itemMetadata: {
            uniqueFieldName: identifier.contentIDKey,
            uniqueFieldValue: identifier.contentIDValue,
            title: result.title,
            url: result.clickUri,
          },
        };
      }
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
    analyticsType: 'SmartSnippets.SourceClick',
    analyticsPayloadBuilder: (state): SmartSnippets.SourceClick | undefined => {
      const result = answerSourceSelector(state)!;
      const identifier = documentIdentifier(result);
      const searchUid = state.search?.response.searchUid;
      if (searchUid) {
        return {
          snippetType: 'SmartSnippet',
          responseId: searchUid,
          itemMetadata: {
            uniqueFieldName: identifier.contentIDKey,
            uniqueFieldValue: identifier.contentIDValue,
            title: result.title,
            url: result.clickUri,
          },
        };
      }
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
    analyticsType: 'SmartSnippets.SourceClick',
    analyticsPayloadBuilder: (state): SmartSnippets.SourceClick | undefined => {
      const result = answerSourceSelector(state)!;
      const identifier = documentIdentifier(result);
      const searchUid = state.search?.response.searchUid;
      if (searchUid) {
        return {
          snippetType: 'SmartSnippet',
          responseId: searchUid,
          itemMetadata: {
            uniqueFieldName: identifier.contentIDKey,
            uniqueFieldValue: identifier.contentIDValue,
            title: result.title,
            url: result.clickUri,
          },
        };
      }
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

export const smartSnippetFeedbackMap: Record<
  SmartSnippetFeedback,
  SmartSnippets.SubmitFeedback['reason']
> = {
  does_not_answer: 'doesNotAnswer',
  partially_answers: 'partiallyAnswers',
  was_not_a_question: 'wasNotAQuestion',
};

export const logSmartSnippetFeedback = (
  feedback: SmartSnippetFeedback
): CustomAction =>
  makeAnalyticsAction({
    prefix: 'analytics/smartSnippet/sendFeedback',
    __legacy__getBuilder: (client) => {
      return client.makeSmartSnippetFeedbackReason(feedback);
    },
    analyticsType: 'SmartSnippets.SubmitFeedback',
    analyticsPayloadBuilder: (
      state
    ): SmartSnippets.SubmitFeedback | undefined => {
      const result = answerSourceSelector(state)!;
      const identifier = documentIdentifier(result);
      const searchUid = state.search?.response.searchUid;
      if (searchUid) {
        return {
          responseId: searchUid,
          snippetType: 'SmartSnippet',
          itemMetadata: {
            uniqueFieldName: identifier.contentIDKey,
            uniqueFieldValue: identifier.contentIDValue,
            title: result.title,
            url: result.clickUri,
          },
          reason: smartSnippetFeedbackMap[feedback],
        };
      }
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
    analyticsType: 'SmartSnippets.SubmitFeedback',
    analyticsPayloadBuilder: (
      state
    ): SmartSnippets.SubmitFeedback | undefined => {
      const result = answerSourceSelector(state)!;
      const identifier = documentIdentifier(result);
      const searchUid = state.search?.response.searchUid;
      if (searchUid) {
        return {
          responseId: searchUid,
          snippetType: 'SmartSnippet',
          itemMetadata: {
            uniqueFieldName: identifier.contentIDKey,
            uniqueFieldValue: identifier.contentIDValue,
            title: result.title,
            url: result.clickUri,
          },
          reason: 'other',
          additionalNotes: details,
        };
      }
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
    analyticsType: 'SmartSnippets.AnswerAction',
    analyticsPayloadBuilder: (
      state
    ): SmartSnippets.AnswerAction | undefined => {
      const relatedQuestion = relatedQuestionSelector(
        state,
        payload.questionAnswerId
      );
      const searchUid = state.search?.response.searchUid;
      if (searchUid && relatedQuestion) {
        const source = answerSourceSelector(state, relatedQuestion.documentId);

        return {
          action: 'expand',
          responseId: searchUid,
          snippetType: 'SmartSnippetSuggestion',
          itemMetadata: {
            uniqueFieldName: relatedQuestion.documentId.contentIdKey,
            uniqueFieldValue: relatedQuestion.documentId.contentIdValue,
            title: source?.title,
            url: source?.clickUri,
          },
        };
      }
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
    analyticsType: 'SmartSnippets.AnswerAction',
    analyticsPayloadBuilder: (
      state
    ): SmartSnippets.AnswerAction | undefined => {
      const relatedQuestion = relatedQuestionSelector(
        state,
        payload.questionAnswerId
      );
      const searchUid = state.search?.response.searchUid;
      if (searchUid && relatedQuestion) {
        const source = answerSourceSelector(state, relatedQuestion.documentId);

        return {
          action: 'collapse',
          responseId: searchUid,
          snippetType: 'SmartSnippetSuggestion',
          itemMetadata: {
            uniqueFieldName: relatedQuestion.documentId.contentIdKey,
            uniqueFieldValue: relatedQuestion.documentId.contentIdValue,
            title: source?.title,
            url: source?.clickUri,
          },
        };
      }
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
    analyticsType: 'SmartSnippets.SourceClick',
    analyticsPayloadBuilder: (state): SmartSnippets.SourceClick | undefined => {
      const relatedQuestion = relatedQuestionSelector(
        state,
        payload.questionAnswerId
      );
      const searchUid = state.search?.response.searchUid;
      if (searchUid && relatedQuestion) {
        const source = answerSourceSelector(state, relatedQuestion.documentId);

        return {
          responseId: searchUid,
          snippetType: 'SmartSnippetSuggestion',
          itemMetadata: {
            uniqueFieldName: relatedQuestion.documentId.contentIdKey,
            uniqueFieldValue: relatedQuestion.documentId.contentIdValue,
            title: source?.title,
            url: source?.clickUri,
          },
        };
      }
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
    analyticsType: 'SmartSnippets.SourceClick',
    analyticsPayloadBuilder: (state): SmartSnippets.SourceClick | undefined => {
      const relatedQuestion = relatedQuestionSelector(
        state,
        identifier.questionAnswerId
      );
      const searchUid = state.search?.response.searchUid;
      if (searchUid && relatedQuestion) {
        const source = answerSourceSelector(state, relatedQuestion.documentId);

        return {
          responseId: searchUid,
          snippetType: 'SmartSnippetSuggestion',
          itemMetadata: {
            uniqueFieldName: relatedQuestion.documentId.contentIdKey,
            uniqueFieldValue: relatedQuestion.documentId.contentIdValue,
            title: source?.title,
            url: source?.clickUri,
          },
        };
      }
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
