import {createAction} from '@reduxjs/toolkit';
import {
  type QuestionAnsweringUniqueIdentifierActionCreatorPayload,
  validateQuestionAnsweringActionCreatorPayload,
} from './question-answering-document-id.js';

export const expandSmartSnippet = createAction('smartSnippet/expand');

export const collapseSmartSnippet = createAction('smartSnippet/collapse');

export const likeSmartSnippet = createAction('smartSnippet/like');

export const dislikeSmartSnippet = createAction('smartSnippet/dislike');

export const openFeedbackModal = createAction(
  'smartSnippet/feedbackModal/open'
);

export const closeFeedbackModal = createAction(
  'smartSnippet/feedbackModal/close'
);

export const expandSmartSnippetRelatedQuestion = createAction(
  'smartSnippet/related/expand',
  (payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload) =>
    validateQuestionAnsweringActionCreatorPayload(payload)
);

export const collapseSmartSnippetRelatedQuestion = createAction(
  'smartSnippet/related/collapse',
  (payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload) =>
    validateQuestionAnsweringActionCreatorPayload(payload)
);
