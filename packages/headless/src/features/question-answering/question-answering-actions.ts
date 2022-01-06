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
