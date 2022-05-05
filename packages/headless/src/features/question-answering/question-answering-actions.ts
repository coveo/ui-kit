import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload';
import {
  QuestionAnsweringDocumentIdActionCreatorPayload,
  QuestionAnsweringUniqueIdentifierActionCreatorPayload,
  uniqueIdentifierPayloadDefinition,
  validateQuestionAnsweringActionCreatorPayload,
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
  (
    payload:
      | QuestionAnsweringUniqueIdentifierActionCreatorPayload
      | QuestionAnsweringDocumentIdActionCreatorPayload
  ) => validateQuestionAnsweringActionCreatorPayload(payload)
);

export const collapseSmartSnippetRelatedQuestion = createAction(
  'smartSnippet/related/collapse',
  (
    payload:
      | QuestionAnsweringUniqueIdentifierActionCreatorPayload
      | QuestionAnsweringDocumentIdActionCreatorPayload
  ) => validateQuestionAnsweringActionCreatorPayload(payload)
);

export const showMoreSmartSnippetRelatedQuestion = createAction(
  'smartSnippet/related/showMore',
  (payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload) =>
    validatePayload<QuestionAnsweringUniqueIdentifierActionCreatorPayload>(
      payload,
      uniqueIdentifierPayloadDefinition()
    )
);

export const showLessSmartSnippetRelatedQuestion = createAction(
  'smartSnippet/related/showLess',
  (payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload) =>
    validatePayload<QuestionAnsweringUniqueIdentifierActionCreatorPayload>(
      payload,
      uniqueIdentifierPayloadDefinition()
    )
);
