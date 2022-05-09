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
   * Collapses a smart snippet.
   *
   * @returns A dispatchable action.
   */
  collapseSmartSnippet(): PayloadAction;
  /**
   * Expands a smart snippet.
   *
   * @returns A dispatchable action.
   */
  expandSmartSnippet(): PayloadAction;
  /**
   * Dislikes a smart snippet (a 'thumbs down' reaction).
   *
   * @returns A dispatchable action.
   */
  dislikeSmartSnippet(): PayloadAction;
  /**
   * Likes a smart snippet (a 'thumbs up' reaction).
   *
   * @returns A dispatchable action.
   */
  likeSmartSnippet(): PayloadAction;
  /**
   * Opens the feedback modal of a smart snippet.
   *
   * @returns A dispatchable action.
   */
  openFeedbackModal(): PayloadAction;
  /**
   * Closes the feedback modal of a smart snippet.
   *
   * @returns A dispatchable action.
   */
  closeFeedbackModal(): PayloadAction;
  /**
   * Expands the specified snippet suggestion.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  expandSmartSnippetRelatedQuestion(
    payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
  ): PayloadAction<
    | QuestionAnsweringUniqueIdentifierActionCreatorPayload
    | QuestionAnsweringDocumentIdActionCreatorPayload
  >;
  /**
   * Collapses the specified snippet suggestion.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  collapseSmartSnippetRelatedQuestion(
    payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
  ): PayloadAction<
    | QuestionAnsweringUniqueIdentifierActionCreatorPayload
    | QuestionAnsweringDocumentIdActionCreatorPayload
  >;
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
  };
}
