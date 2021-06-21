import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload';
import {
  documentIdentifierPayloadDefinition,
  QuestionAnsweringDocumentIdActionCreatorPayload,
} from './question-answering-document-id';

/**
 * Expand a smart snippet.
 */
export const expandSmartSnippet = createAction('smartSnippet/expand');
/**
 * Collapse a smart snippet.
 */
export const collapseSmartSnippet = createAction('smartSnippet/collapse');
/**
 * Like, or thumbs up, a smart snippet.
 */
export const likeSmartSnippet = createAction('smartSnippet/like');
/**
 * Dislike, or thumbs down, a smart snippet.
 */
export const dislikeSmartSnippet = createAction('smartSnippet/dislike');

/**
 * Expand a related question.
 */
export const expandSmartSnippetRelatedQuestion = createAction(
  'smartSnippet/related/expand',
  (payload: QuestionAnsweringDocumentIdActionCreatorPayload) =>
    validatePayload(payload, documentIdentifierPayloadDefinition())
);

/**
 * Collapse a related question.
 */
export const collapseSmartSnippetRelatedQuestion = createAction(
  'smartSnippet/related/collapse',
  (payload: QuestionAnsweringDocumentIdActionCreatorPayload) =>
    validatePayload(payload, documentIdentifierPayloadDefinition())
);
