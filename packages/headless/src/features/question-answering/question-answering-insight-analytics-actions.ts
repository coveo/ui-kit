import {validatePayload} from '../../utils/validate-payload';
import {
  InsightAction,
  documentIdentifier,
  makeInsightAnalyticsAction,
  partialDocumentInformation,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';
import {SmartSnippetFeedback} from './question-answering-analytics-actions';
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

export const logExpandSmartSnippet = (): InsightAction =>
  makeInsightAnalyticsAction('analytics/smartSnippet/expand', (client, state) =>
    client.logExpandSmartSnippet(
      getCaseContextAnalyticsMetadata(state.insightCaseContext)
    )
  );

export const logCollapseSmartSnippet = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippet/collapse',
    (client, state) =>
      client.logCollapseSmartSnippet(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );

export const logLikeSmartSnippet = (): InsightAction =>
  makeInsightAnalyticsAction('analytics/smartSnippet/like', (client, state) =>
    client.logLikeSmartSnippet(
      getCaseContextAnalyticsMetadata(state.insightCaseContext)
    )
  );

export const logDislikeSmartSnippet = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippet/dislike',
    (client, state) =>
      client.logDislikeSmartSnippet(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );

export const logOpenSmartSnippetSource = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippet/source/open',
    (client, state) => {
      const result = answerSourceSelector(state)!;
      return client.logOpenSmartSnippetSource(
        partialDocumentInformation(result, state),
        documentIdentifier(result),
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );

export const logOpenSmartSnippetInlineLink = (
  payload: QuestionAnsweringInlineLinkActionCreatorPayload
): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippet/source/open',
    (client, state) => {
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
    }
  );

export const logOpenSmartSnippetFeedbackModal = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippet/feedbackModal/open',
    (client, state) =>
      client.logOpenSmartSnippetFeedbackModal(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );

export const logCloseSmartSnippetFeedbackModal = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippet/feedbackModal/close',
    (client, state) =>
      client.logCloseSmartSnippetFeedbackModal(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );

export const logSmartSnippetFeedback = (
  feedback: SmartSnippetFeedback
): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippet/sendFeedback',
    (client, state) =>
      client.logSmartSnippetFeedbackReason(
        feedback,
        undefined,
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );

export const logSmartSnippetDetailedFeedback = (
  details: string
): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippet/sendFeedback',
    (client, state) =>
      client.logSmartSnippetFeedbackReason(
        'other',
        details,
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );

export const logExpandSmartSnippetSuggestion = (
  payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
): InsightAction =>
  makeInsightAnalyticsAction(
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
      return client.logExpandSmartSnippetSuggestion(
        {
          question: relatedQuestion.question,
          answerSnippet: relatedQuestion.answerSnippet,
          documentId: relatedQuestion.documentId,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );

export const logCollapseSmartSnippetSuggestion = (
  payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippetSuggestion/collapse',
    (client, state) => {
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
    }
  );

export const logOpenSmartSnippetSuggestionSource = (
  payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippetSuggestion/source/open',
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

      return client.logOpenSmartSnippetSuggestionSource(
        partialDocumentInformation(source, state),
        {
          question: relatedQuestion.question,
          answerSnippet: relatedQuestion.answerSnippet,
          documentId: relatedQuestion.documentId,
        },
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );

export const logOpenSmartSnippetSuggestionInlineLink = (
  identifier: QuestionAnsweringUniqueIdentifierActionCreatorPayload,
  link: QuestionAnsweringInlineLinkActionCreatorPayload
): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippetSuggestion/source/open',
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
    }
  );

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
