import {Qna, ItemClick, Feedback} from '@coveo/relay-event-types';
import {validatePayload} from '../../utils/validate-payload';
import {
  InsightAction,
  analyticsEventItemMetadata,
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
  makeInsightAnalyticsAction({
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
          id: state.questionAnswering?.questionAnswerId || '',
          type: 'SmartSnippet',
        },
      };
    },
  });

export const logCollapseSmartSnippet = (): InsightAction =>
  makeInsightAnalyticsAction({
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
          id: state.questionAnswering?.questionAnswerId || '',
          type: 'SmartSnippet',
        },
      };
    },
  });

export const logLikeSmartSnippet = (): InsightAction =>
  makeInsightAnalyticsAction({
    prefix: 'analytics/smartSnippet/like',
    __legacy__getBuilder: (client, state) => {
      return client.logLikeSmartSnippet(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    },
    analyticsType: 'Qna.Feedback',
    analyticsPayloadBuilder: (state): Qna.FeedbackSubmit => {
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

export const logDislikeSmartSnippet = (): InsightAction =>
  makeInsightAnalyticsAction({
    prefix: 'analytics/smartSnippet/dislike',
    __legacy__getBuilder: (client, state) => {
      return client.logDislikeSmartSnippet(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    },
    analyticsType: 'Qna.Feedback',
    analyticsPayloadBuilder: (state): Qna.FeedbackSubmit => {
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

export const logOpenSmartSnippetSource = (): InsightAction =>
  makeInsightAnalyticsAction({
    prefix: 'analytics/smartSnippet/source/open',
    __legacy__getBuilder: (client, state) => {
      const result = answerSourceSelector(state)!;
      return client.logOpenSmartSnippetSource(
        partialDocumentInformation(result, state),
        documentIdentifier(result),
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
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

//TODO: SFINT-5435
export const logOpenSmartSnippetFeedbackModal = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/smartSnippet/feedbackModal/open',
    (client, state) =>
      client.logOpenSmartSnippetFeedbackModal(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );

//TODO: SFINT-5435
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
  makeInsightAnalyticsAction({
    prefix: 'analytics/smartSnippet/sendFeedback',
    __legacy__getBuilder: (client, state) => {
      return client.logSmartSnippetFeedbackReason(
        feedback,
        undefined,
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    },
    analyticsType: 'Qna.Feedback',
    analyticsPayloadBuilder: (state): Qna.FeedbackSubmit => {
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
): InsightAction =>
  makeInsightAnalyticsAction({
    prefix: 'analytics/smartSnippet/sendFeedback',
    __legacy__getBuilder: (client, state) => {
      return client.logSmartSnippetFeedbackReason(
        'other',
        details,
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    },
    analyticsType: 'Qna.Feedback',
    analyticsPayloadBuilder: (state): Qna.FeedbackSubmit => {
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
): InsightAction =>
  makeInsightAnalyticsAction({
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
): InsightAction =>
  makeInsightAnalyticsAction({
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
): InsightAction =>
  makeInsightAnalyticsAction({
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

//TODO: To be reviewed
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
