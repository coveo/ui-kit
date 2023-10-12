import {validatePayload} from '../../utils/validate-payload.js';
import {SmartSnippetFeedback} from '../analytics/index.js';
import {
  AnalyticsType,
  InsightAction,
  documentIdentifier,
  makeInsightAnalyticsAction,
  partialDocumentInformation,
} from '../analytics/analytics-utils.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';
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

export const logExpandSmartSnippet = (): InsightAction<AnalyticsType.Custom> =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippet/expand',
    AnalyticsType.Custom,
    (client, state) =>
      client.logExpandSmartSnippet(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );

export const logCollapseSmartSnippet =
  (): InsightAction<AnalyticsType.Custom> =>
    makeInsightAnalyticsAction(
      'analytics/smartSnippet/collapse',
      AnalyticsType.Custom,
      (client, state) =>
        client.logCollapseSmartSnippet(
          getCaseContextAnalyticsMetadata(state.insightCaseContext)
        )
    );

export const logLikeSmartSnippet = (): InsightAction<AnalyticsType.Custom> =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippet/like',
    AnalyticsType.Custom,
    (client, state) =>
      client.logLikeSmartSnippet(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );

export const logDislikeSmartSnippet = (): InsightAction<AnalyticsType.Custom> =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippet/dislike',
    AnalyticsType.Custom,
    (client, state) =>
      client.logDislikeSmartSnippet(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );

export const logOpenSmartSnippetSource =
  (): InsightAction<AnalyticsType.Click> =>
    makeInsightAnalyticsAction(
      'analytics/smartSnippet/source/open',
      AnalyticsType.Click,
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
): InsightAction<AnalyticsType.Click> =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippet/source/open',
    AnalyticsType.Click,
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

export const logOpenSmartSnippetFeedbackModal =
  (): InsightAction<AnalyticsType.Custom> =>
    makeInsightAnalyticsAction(
      'analytics/smartSnippet/feedbackModal/open',
      AnalyticsType.Custom,
      (client, state) =>
        client.logOpenSmartSnippetFeedbackModal(
          getCaseContextAnalyticsMetadata(state.insightCaseContext)
        )
    );

export const logCloseSmartSnippetFeedbackModal =
  (): InsightAction<AnalyticsType.Custom> =>
    makeInsightAnalyticsAction(
      'analytics/smartSnippet/feedbackModal/close',
      AnalyticsType.Custom,
      (client, state) =>
        client.logCloseSmartSnippetFeedbackModal(
          getCaseContextAnalyticsMetadata(state.insightCaseContext)
        )
    );

export const logSmartSnippetFeedback = (
  feedback: SmartSnippetFeedback
): InsightAction<AnalyticsType.Custom> =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippet/sendFeedback',
    AnalyticsType.Custom,
    (client, state) =>
      client.logSmartSnippetFeedbackReason(
        feedback,
        undefined,
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );

export const logSmartSnippetDetailedFeedback = (
  details: string
): InsightAction<AnalyticsType.Custom> =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippet/sendFeedback',
    AnalyticsType.Custom,
    (client, state) =>
      client.logSmartSnippetFeedbackReason(
        'other',
        details,
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );

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
