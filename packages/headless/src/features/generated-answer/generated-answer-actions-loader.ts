import {PayloadAction} from '@reduxjs/toolkit';
import {
  GeneratedAnswerCitationsPayload,
  GeneratedAnswerMessagePayload,
} from '../../api/generated-answer/generated-answer-event-payload';
import {CoreEngine} from '../../app/engine';
import {GeneratedResponseFormat} from '../../controllers/generated-answer/headless-generated-answer';
import {
  resetAnswer,
  abortStream,
  streamAnswer,
  closeGeneratedAnswerFeedbackModal,
  dislikeGeneratedAnswer,
  likeGeneratedAnswer,
  openGeneratedAnswerFeedbackModal,
  registerFieldsToIncludeInCitations,
  sendGeneratedAnswerFeedback,
  setIsLoading,
  setIsStreaming,
  setIsVisible,
  updateCitations,
  updateError,
  updateMessage,
  updateResponseFormat,
  GeneratedAnswerErrorPayload,
} from './generated-answer-actions';
import {generatedAnswerReducer as generatedAnswer} from './generated-answer-slice';

/**
 * The generated answer action creators.
 */
export interface GeneratedAnswerActionCreators {
  /**
   * Resets the generated answer state to a clean slate.
   *
   * @returns A dispatchable action.
   */
  resetAnswer(): PayloadAction;
  /**
   * Aborts the ongoing stream.
   *
   * @returns A dispatchable action.
   */
  abortStream(): ReturnType<typeof abortStream>;
  /**
   * Streams the generated answer.
   *
   * @returns A dispatchable action.
   */
  streamAnswer(payload: {streamId: string}): ReturnType<typeof streamAnswer>;
  /**
   * Close the feedback modal.
   *
   * @returns A dispatchable action.
   */
  closeGeneratedAnswerFeedbackModal(): PayloadAction;
  /**
   * Dislike the generated answer.
   *
   * @returns A dispatchable action.
   */
  dislikeGeneratedAnswer(): PayloadAction;
  /**
   * Like the generated answer.
   *
   * @returns A dispatchable action.
   */
  likeGeneratedAnswer(): PayloadAction;
  /**
   * Open the feedback modal.
   *
   * @returns A dispatchable action.
   */
  openGeneratedAnswerFeedbackModal(): PayloadAction;
  /**
   * Register fields to include in citations.
   *
   * @param payload - The fields to include in citations.
   * @returns A dispatchable action.
   */
  registerFieldsToIncludeInCitations(
    payload: string[]
  ): PayloadAction<string[]>;
  /**
   * Sends the generated answer feedback.
   *
   * @returns A dispatchable action.
   */
  sendGeneratedAnswerFeedback(): PayloadAction;
  /**
   * Sets the loading state.
   *
   * @param payload - Whether the generated answer is loading.
   * @returns A dispatchable action.
   */
  setIsLoading(payload: boolean): PayloadAction<boolean>;
  /**
   * Sets the streaming state.
   * @param payload - Whether the generated answer is streaming.
   * @returns A dispatchable action.
   */
  setIsStreaming(payload: boolean): PayloadAction<boolean>;
  /**
   * Sets the visibility state.
   * @param payload - Whether the generated answer is visible.
   * @returns A dispatchable action.
   */
  setIsVisible(payload: boolean): PayloadAction<boolean>;
  /**
   * Update citations.
   * @param payload - The new citations.
   * @returns A dispatchable action.
   */
  updateCitations(
    payload: GeneratedAnswerCitationsPayload
  ): PayloadAction<GeneratedAnswerCitationsPayload>;
  /**
   * Update the error.
   * @param payload - The new error.
   * @returns A dispatchable action.
   */
  updateError(
    payload: GeneratedAnswerErrorPayload
  ): PayloadAction<GeneratedAnswerErrorPayload>;
  /**
   * Update the message.
   * @param payload - The new message.
   * @returns A dispatchable action.
   */
  updateMessage(
    payload: GeneratedAnswerMessagePayload
  ): PayloadAction<GeneratedAnswerMessagePayload>;
  /**
   * Update the response format.
   * @param payload - The new response format.
   * @returns A dispatchable action.
   */
  updateResponseFormat(
    payload: GeneratedResponseFormat
  ): PayloadAction<GeneratedResponseFormat>;
}

/**
 * Loads the `generatedAnswer` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadGeneratedAnswerActions(
  engine: CoreEngine
): GeneratedAnswerActionCreators {
  engine.addReducers({generatedAnswer});

  return {
    resetAnswer,
    abortStream,
    streamAnswer,
    closeGeneratedAnswerFeedbackModal,
    dislikeGeneratedAnswer,
    likeGeneratedAnswer,
    openGeneratedAnswerFeedbackModal,
    registerFieldsToIncludeInCitations,
    sendGeneratedAnswerFeedback,
    setIsLoading,
    setIsStreaming,
    setIsVisible,
    updateCitations,
    updateError,
    updateMessage,
    updateResponseFormat,
  };
}
