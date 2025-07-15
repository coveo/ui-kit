import type {PayloadAction} from '@reduxjs/toolkit';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {questionAnsweringReducer as questionAnswering} from '../../features/question-answering/question-answering-slice.js';
import {
  closeFeedbackModal,
  collapseSmartSnippet,
  collapseSmartSnippetRelatedQuestion,
  dislikeSmartSnippet,
  expandSmartSnippet,
  expandSmartSnippetRelatedQuestion,
  likeSmartSnippet,
  openFeedbackModal,
} from './question-answering-actions.js';
import type {QuestionAnsweringUniqueIdentifierActionCreatorPayload} from './question-answering-document-id.js';

/**
 * The question answering action creators.
 *
 * @group Actions
 * @category QuestionAnswering
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
  ): PayloadAction<QuestionAnsweringUniqueIdentifierActionCreatorPayload>;
  /**
   * Collapses the specified snippet suggestion.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  collapseSmartSnippetRelatedQuestion(
    payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
  ): PayloadAction<QuestionAnsweringUniqueIdentifierActionCreatorPayload>;
}

/**
 * Loads the `questionAnswering` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 *
 * @group Actions
 * @category QuestionAnswering
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
