import {PayloadAction} from '@reduxjs/toolkit';
import {questionAnswering} from '../../app/reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  collapseSmartSnippet,
  dislikeSmartSnippet,
  likeSmartSnippet,
  expandSmartSnippet,
  openFeedbackModal,
  closeFeedbackModal,
  collapseSmartSnippetRelatedQuestion,
  expandSmartSnippetRelatedQuestion,
  showLessSmartSnippetRelatedQuestion,
  showMoreSmartSnippetRelatedQuestion,
} from './question-answering-actions';
import {
  QuestionAnsweringUniqueIdentifierActionCreatorPayload,
  QuestionAnsweringDocumentIdActionCreatorPayload,
} from './question-answering-document-id';

/**
 * The question answering action creators.
 */
export interface QuestionAnsweringActionCreators {
  /**
   * Collapse a smart snippet
   *
   * @returns A dispatchable action.
   */
  collapseSmartSnippet(): PayloadAction;
  /**
   * Expand a smart snippet
   *
   * @returns A dispatchable action.
   */
  expandSmartSnippet(): PayloadAction;
  /**
   * Dislike, or thumbs down, a smart snippet
   *
   * @returns A dispatchable action.
   */
  dislikeSmartSnippet(): PayloadAction;
  /**
   * Like, or thumbs up, a smart snippet
   *
   * @returns A dispatchable action.
   */
  likeSmartSnippet(): PayloadAction;
  /**
   * Opens the feedback modal of a smart snippet
   *
   * @returns A dispatchable action.
   */
  openFeedbackModal(): PayloadAction;
  /**
   * Closes the feedback modal of a smart snippet
   *
   * @returns A dispatchable action.
   */
  closeFeedbackModal(): PayloadAction;
  /**
   * Expand the specified snippet suggestion
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  expandSmartSnippetRelatedQuestion(
    payload:
      | QuestionAnsweringUniqueIdentifierActionCreatorPayload
      | QuestionAnsweringDocumentIdActionCreatorPayload
  ): PayloadAction<
    | QuestionAnsweringUniqueIdentifierActionCreatorPayload
    | QuestionAnsweringDocumentIdActionCreatorPayload
  >;
  /**
   * Collapse the specified snippet suggestion
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  collapseSmartSnippetRelatedQuestion(
    payload:
      | QuestionAnsweringUniqueIdentifierActionCreatorPayload
      | QuestionAnsweringDocumentIdActionCreatorPayload
  ): PayloadAction<
    | QuestionAnsweringUniqueIdentifierActionCreatorPayload
    | QuestionAnsweringDocumentIdActionCreatorPayload
  >;
  /**
   * See more of the specified snippet suggestion
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  showMoreSmartSnippetRelatedQuestion(
    payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
  ): PayloadAction<QuestionAnsweringUniqueIdentifierActionCreatorPayload>;
  /**
   * See less of the specified snippet suggestion
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  showLessSmartSnippetRelatedQuestion(
    payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
  ): PayloadAction<QuestionAnsweringUniqueIdentifierActionCreatorPayload>;
}

/**
 * Loads the `questionAnswering` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadQuestionAnsweringActions(
  engine: SearchEngine
): QuestionAnsweringActionCreators {
  engine.addReducers({questionAnswering});

  return {
    collapseSmartSnippet,
    expandSmartSnippet,
    dislikeSmartSnippet,
    likeSmartSnippet,
    openFeedbackModal,
    closeFeedbackModal,
    expandSmartSnippetRelatedQuestion,
    collapseSmartSnippetRelatedQuestion,
    showMoreSmartSnippetRelatedQuestion,
    showLessSmartSnippetRelatedQuestion,
  };
}
