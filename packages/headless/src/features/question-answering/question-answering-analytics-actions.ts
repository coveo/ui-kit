import {validatePayload} from '../../utils/validate-payload';
import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';
import {
  documentIdentifierPayloadDefinition,
  QuestionAnsweringDocumentIdActionCreatorPayload,
} from './question-answering-document-id';

export type SmartSnippetFeedback =
  | 'does_not_answer'
  | 'partially_answers'
  | 'was_not_a_question';

export const logExpandSmartSnippet = makeAnalyticsAction(
  'analytics/smartSnippet/expand',
  AnalyticsType.Custom,
  (client) => client.logExpandSmartSnippet()
);

export const logCollapseSmartSnippet = makeAnalyticsAction(
  'analytics/smartSnippet/collapse',
  AnalyticsType.Custom,
  (client) => client.logCollapseSmartSnippet()
);

export const logLikeSmartSnippet = makeAnalyticsAction(
  'analytics/smartSnippet/like',
  AnalyticsType.Custom,
  (client) => client.logLikeSmartSnippet()
);

export const logDislikeSmartSnippet = makeAnalyticsAction(
  'analytics/smartSnippet/dislike',
  AnalyticsType.Custom,
  (client) => client.logDislikeSmartSnippet()
);

export const logOpenSmartSnippetFeedbackModal = makeAnalyticsAction(
  'analytics/smartSnippet/feedbackModal/open',
  AnalyticsType.Custom,
  (client) => client.logOpenSmartSnippetFeedbackModal()
);

export const logCloseSmartSnippetFeedbackModal = makeAnalyticsAction(
  'analytics/smartSnippet/feedbackModal/close',
  AnalyticsType.Custom,
  (client) => client.logCloseSmartSnippetFeedbackModal()
);

export const logSmartSnippetFeedback = (feedback: SmartSnippetFeedback) =>
  makeAnalyticsAction(
    'analytics/smartSnippet/sendFeedback',
    AnalyticsType.Custom,
    (client) => client.logSmartSnippetFeedbackReason(feedback)
  )();

export const logSmartSnippetDetailedFeedback = (details: string) =>
  makeAnalyticsAction(
    'analytics/smartSnippet/sendFeedback',
    AnalyticsType.Custom,
    (client) => client.logSmartSnippetFeedbackReason('other', details)
  )();

export const logExpandSmartSnippetSuggestion = (
  payload: QuestionAnsweringDocumentIdActionCreatorPayload
) =>
  makeAnalyticsAction(
    'analytics/smartSnippetSuggestion/expand',
    AnalyticsType.Custom,
    (client) => {
      validatePayload(payload, documentIdentifierPayloadDefinition());
      return client.logExpandSmartSnippetSuggestion(payload);
    }
  )();

export const logCollapseSmartSnippetSuggestion = (
  payload: QuestionAnsweringDocumentIdActionCreatorPayload
) =>
  makeAnalyticsAction(
    'analytics/smartSnippetSuggestion/expand',
    AnalyticsType.Custom,
    (client) => {
      validatePayload(payload, documentIdentifierPayloadDefinition());
      return client.logCollapseSmartSnippetSuggestion(payload);
    }
  )();
