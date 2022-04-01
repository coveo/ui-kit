import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload';
import {
  documentIdentifierPayloadDefinition,
  QuestionAnsweringDocumentIdActionCreatorPayload,
} from './question-answering-document-id';

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
  (payload: QuestionAnsweringDocumentIdActionCreatorPayload) =>
    validatePayload(payload, documentIdentifierPayloadDefinition())
);

export const collapseSmartSnippetRelatedQuestion = createAction(
  'smartSnippet/related/collapse',
  (payload: QuestionAnsweringDocumentIdActionCreatorPayload) =>
    validatePayload(payload, documentIdentifierPayloadDefinition())
);
