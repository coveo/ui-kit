import {validatePayload} from '../../utils/validate-payload';
import {SmartSnippetFeedback} from '../analytics';
import {
  AnalyticsType,
  InsightAction,
  documentIdentifier,
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

export const logExpandSmartSnippet = (): InsightAction<AnalyticsType.Custom> =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippet/expand',
    AnalyticsType.Custom,
    (client) => client.logExpandSmartSnippet()
  );

export const logCollapseSmartSnippet =
  (): InsightAction<AnalyticsType.Custom> =>
    makeInsightAnalyticsAction(
      'analytics/smartSnippet/collapse',
      AnalyticsType.Custom,
      (client) => client.logCollapseSmartSnippet()
    );

export const logLikeSmartSnippet = (): InsightAction<AnalyticsType.Custom> =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippet/like',
    AnalyticsType.Custom,
    (client) => client.makeLikeSmartSnippet()
  );

export const logDislikeSmartSnippet = (): InsightAction<AnalyticsType.Custom> =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippet/dislike',
    AnalyticsType.Custom,
    (client) => client.makeDislikeSmartSnippet()
  );

/**
 * @returns A dispatchable action.
 */
export const logOpenSmartSnippetSource =
  (): InsightAction<AnalyticsType.Click> =>
    makeInsightAnalyticsAction(
      'analytics/smartSnippet/source/open',
      AnalyticsType.Click,
      (client, state) => {
        const result = answerSourceSelector(state)!;
        return client.makeOpenSmartSnippetSource(
          partialDocumentInformation(result, state),
          documentIdentifier(result)
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
      return client.makeOpenSmartSnippetInlineLink(
        partialDocumentInformation(result, state),
        {
          ...documentIdentifier(result),
          ...payload,
        }
      );
    }
  );

export const logOpenSmartSnippetFeedbackModal =
  (): InsightAction<AnalyticsType.Custom> =>
    makeInsightAnalyticsAction(
      'analytics/smartSnippet/feedbackModal/open',
      AnalyticsType.Custom,
      (client) => client.makeOpenSmartSnippetFeedbackModal()
    );

export const logCloseSmartSnippetFeedbackModal =
  (): InsightAction<AnalyticsType.Custom> =>
    makeInsightAnalyticsAction(
      'analytics/smartSnippet/feedbackModal/close',
      AnalyticsType.Custom,
      (client) => client.makeCloseSmartSnippetFeedbackModal()
    );

export const logSmartSnippetFeedback = (
  feedback: SmartSnippetFeedback
): InsightAction<AnalyticsType.Custom> =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippet/sendFeedback',
    AnalyticsType.Custom,
    (client) => client.makeSmartSnippetFeedbackReason(feedback)
  );

export const logSmartSnippetDetailedFeedback = (
  details: string
): InsightAction<AnalyticsType.Custom> =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippet/sendFeedback',
    AnalyticsType.Custom,
    (client) => client.makeSmartSnippetFeedbackReason('other', details)
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
