import {createAction} from '@reduxjs/toolkit';
import {QuestionAnswerDocumentIdentifier} from '../../controllers';
import {validatePayload} from '../../utils/validate-payload';
import {
  documentIdentifierPayloadDefinition,
  QuestionAnsweringDocumentIdentifierActionCreatorPayload,
} from './question-answering-common';

export interface SmartSnippetRelatedQuestionActionCreatorPayload
  extends QuestionAnswerDocumentIdentifier {}

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
  (payload: QuestionAnsweringDocumentIdentifierActionCreatorPayload) =>
    validatePayload(payload, documentIdentifierPayloadDefinition())
);

/**
 * Collapse a related question.
 */
export const collapseSmartSnippetRelatedQuestion = createAction(
  'smartSnippet/related/collapse',
  (payload: QuestionAnsweringDocumentIdentifierActionCreatorPayload) =>
    validatePayload(payload, documentIdentifierPayloadDefinition())
);
