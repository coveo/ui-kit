import {validatePayload} from '../../utils/validate-payload';
import {
  AnalyticsType,
  InsightAction,
  makeInsightAnalyticsAction,
  partialDocumentInformation,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';
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

export const logExpandSmartSnippetSuggestion = (
  payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
): InsightAction<AnalyticsType.Custom> =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippetSuggestion/expand',
    AnalyticsType.Custom,
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
): InsightAction<AnalyticsType.Custom> =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippetSuggestion/collapse',
    AnalyticsType.Custom,
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
): InsightAction<AnalyticsType.Click> =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippetSuggestion/source/open',
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
): InsightAction<AnalyticsType.Click> =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippetSuggestion/source/open',
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
