import {Qna} from '@coveo/relay-event-types';
import {validatePayload} from '../../utils/validate-payload.js';
import {
  InsightAction,
  documentIdentifier,
  makeInsightAnalyticsActionFactory,
  partialDocumentInformation,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';
import {SmartSnippetFeedback} from './question-answering-analytics-actions.js';
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

export const logExpandSmartSnippet = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.expandSmartSnippet)({
    prefix: 'analytics/smartSnippet/expand',
    __legacy__getBuilder: (client, state) => {
      return client.logExpandSmartSnippet(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
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

export const logCollapseSmartSnippet = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.collapseSmartSnippet)({
    prefix: 'analytics/smartSnippet/collapse',
    __legacy__getBuilder: (client, state) => {
      return client.logCollapseSmartSnippet(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
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

export const logLikeSmartSnippet = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.likeSmartSnippet)({
    prefix: 'analytics/smartSnippet/like',
    __legacy__getBuilder: (client, state) => {
      return client.logLikeSmartSnippet(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
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

export const logDislikeSmartSnippet = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.dislikeSmartSnippet)({
    prefix: 'analytics/smartSnippet/dislike',
    __legacy__getBuilder: (client, state) => {
      return client.logDislikeSmartSnippet(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
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
