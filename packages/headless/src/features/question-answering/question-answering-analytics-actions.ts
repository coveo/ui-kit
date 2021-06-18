import {validatePayload} from '../../utils/validate-payload';
import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';
import {
  documentIdentifierPayloadDefinition,
  QuestionAnsweringDocumentIdActionCreatorPayload,
} from './question-answering-document-id';

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
