import type {SmartSnippets} from '@coveo/relay-event-types';
import {validatePayload} from '../../utils/validate-payload.js';
import {
  documentIdentifier,
  type InsightAction,
  makeInsightAnalyticsActionFactory,
  partialDocumentInformation,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';
import {
  type SmartSnippetFeedback,
  smartSnippetFeedbackMap,
} from './question-answering-analytics-actions.js';
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

export const logExpandSmartSnippet = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.expandSmartSnippet)({
    prefix: 'analytics/smartSnippet/expand',
    __legacy__getBuilder: (client, state) => {
      return client.logExpandSmartSnippet(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
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

export const logCollapseSmartSnippet = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.collapseSmartSnippet)({
    prefix: 'analytics/smartSnippet/collapse',
    __legacy__getBuilder: (client, state) => {
      return client.logCollapseSmartSnippet(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
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

export const logLikeSmartSnippet = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.likeSmartSnippet)({
    prefix: 'analytics/smartSnippet/like',
    __legacy__getBuilder: (client, state) => {
      return client.logLikeSmartSnippet(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
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

export const logDislikeSmartSnippet = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.dislikeSmartSnippet)({
    prefix: 'analytics/smartSnippet/dislike',
    __legacy__getBuilder: (client, state) => {
      return client.logDislikeSmartSnippet(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
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

export const logOpenSmartSnippetSource = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.openSmartSnippetSource)({
    prefix: 'analytics/smartSnippet/source/open',
    __legacy__getBuilder: (client, state) => {
      const result = answerSourceSelector(state)!;
      return client.logOpenSmartSnippetSource(
        partialDocumentInformation(result, state),
        documentIdentifier(result),
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
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
): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.openSmartSnippetSource)({
    prefix: 'analytics/smartSnippet/source/open',
    __legacy__getBuilder: (client, state) => {
      validatePayload(payload, inlineLinkPayloadDefinition());
      const result = answerSourceSelector(state)!;
      return client.logOpenSmartSnippetInlineLink(
        partialDocumentInformation(result, state),
        {
          ...documentIdentifier(result),
          ...payload,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
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
export const logOpenSmartSnippetFeedbackModal = (): InsightAction =>
  makeInsightAnalyticsActionFactory(
    SearchPageEvents.openSmartSnippetFeedbackModal
  )('analytics/smartSnippet/feedbackModal/open', (client, state) =>
    client.logOpenSmartSnippetFeedbackModal(
      getCaseContextAnalyticsMetadata(state.insightCaseContext)
    )
  );

//TODO: SFINT-5435
export const logCloseSmartSnippetFeedbackModal = (): InsightAction =>
  makeInsightAnalyticsActionFactory(
    SearchPageEvents.closeSmartSnippetFeedbackModal
  )('analytics/smartSnippet/feedbackModal/close', (client, state) =>
    client.logCloseSmartSnippetFeedbackModal(
      getCaseContextAnalyticsMetadata(state.insightCaseContext)
    )
  );

export const logSmartSnippetFeedback = (
  feedback: SmartSnippetFeedback
): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.sendSmartSnippetReason)({
    prefix: 'analytics/smartSnippet/sendFeedback',
    __legacy__getBuilder: (client, state) => {
      return client.logSmartSnippetFeedbackReason(
        feedback,
        undefined,
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
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
): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.sendSmartSnippetReason)({
    prefix: 'analytics/smartSnippet/sendFeedback',
    __legacy__getBuilder: (client, state) => {
      return client.logSmartSnippetFeedbackReason(
        'other',
        details,
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
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
): InsightAction =>
  makeInsightAnalyticsActionFactory(
    SearchPageEvents.expandSmartSnippetSuggestion
  )({
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
      return client.logExpandSmartSnippetSuggestion(
        {
          question: relatedQuestion.question,
          answerSnippet: relatedQuestion.answerSnippet,
          documentId: relatedQuestion.documentId,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
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
): InsightAction =>
  makeInsightAnalyticsActionFactory(
    SearchPageEvents.collapseSmartSnippetSuggestion
  )({
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
      return client.logCollapseSmartSnippetSuggestion(
        {
          question: relatedQuestion.question,
          answerSnippet: relatedQuestion.answerSnippet,
          documentId: relatedQuestion.documentId,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
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
): InsightAction =>
  makeInsightAnalyticsActionFactory(
    SearchPageEvents.openSmartSnippetSuggestionSource
  )({
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

      return client.logOpenSmartSnippetSuggestionSource(
        partialDocumentInformation(source, state),
        {
          question: relatedQuestion.question,
          answerSnippet: relatedQuestion.answerSnippet,
          documentId: relatedQuestion.documentId,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
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
): InsightAction =>
  makeInsightAnalyticsActionFactory(
    SearchPageEvents.openSmartSnippetSuggestionSource
  )({
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

      return client.logOpenSmartSnippetSuggestionInlineLink(
        partialDocumentInformation(source, state),
        {
          question: relatedQuestion.question,
          answerSnippet: relatedQuestion.answerSnippet,
          documentId: relatedQuestion.documentId,
          linkText: link.linkText,
          linkURL: link.linkURL,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
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

export const insightSmartSnippetAnalyticsClient = {
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
