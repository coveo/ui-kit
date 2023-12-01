import {createReducer} from '@reduxjs/toolkit';
import {RETRYABLE_STREAM_ERROR_CODE} from '../../api/generated-answer/generated-answer-client';
import {
  closeGeneratedAnswerFeedbackModal,
  dislikeGeneratedAnswer,
  likeGeneratedAnswer,
  openGeneratedAnswerFeedbackModal,
  resetAnswer,
  setIsVisible,
  setIsLoading,
  setIsStreaming,
  updateCitations,
  updateError,
  updateMessage,
  updateResponseFormat,
  sendGeneratedAnswerFeedback,
  registerFieldsToIncludeInCitations,
} from './generated-answer-actions';
import {getGeneratedAnswerInitialState} from './generated-answer-state';

export const generatedAnswerReducer = createReducer(
  getGeneratedAnswerInitialState(),
  (builder) =>
    builder
      .addCase(setIsVisible, (state, {payload}) => {
        state.isVisible = payload;
      })
      .addCase(updateMessage, (state, {payload}) => {
        state.isLoading = false;
        state.isStreaming = true;
        if (!state.answer) {
          state.answer = '';
        }
        state.answer += payload.textDelta;
        delete state.error;
      })
      .addCase(updateCitations, (state, {payload}) => {
        console.log(payload.citations);
        state.isLoading = false;
        state.isStreaming = true;
        state.citations = state.citations.concat(payload.citations);
        delete state.error;
      })
      .addCase(updateError, (state, {payload}) => {
        state.isLoading = false;
        state.isStreaming = false;
        state.error = {
          ...payload,
          isRetryable: payload.code === RETRYABLE_STREAM_ERROR_CODE,
        };
        state.citations = [];
        delete state.answer;
      })
      .addCase(likeGeneratedAnswer, (state) => {
        state.liked = true;
        state.disliked = false;
      })
      .addCase(dislikeGeneratedAnswer, (state) => {
        state.liked = false;
        state.disliked = true;
      })
      .addCase(openGeneratedAnswerFeedbackModal, (state) => {
        state.feedbackModalOpen = true;
      })
      .addCase(closeGeneratedAnswerFeedbackModal, (state) => {
        state.feedbackModalOpen = false;
      })
      .addCase(sendGeneratedAnswerFeedback, (state) => {
        state.feedbackSubmitted = true;
      })
      .addCase(resetAnswer, (state) => {
        return {
          ...getGeneratedAnswerInitialState(),
          responseFormat: state.responseFormat,
          fieldsToIncludeInCitations: state.fieldsToIncludeInCitations,
          isVisible: state.isVisible,
        };
      })
      .addCase(setIsLoading, (state, {payload}) => {
        state.isLoading = payload;
      })
      .addCase(setIsStreaming, (state, {payload}) => {
        state.isStreaming = payload;
      })
      .addCase(updateResponseFormat, (state, {payload}) => {
        state.responseFormat = payload;
      })
      .addCase(registerFieldsToIncludeInCitations, (state, action) => {
        state.fieldsToIncludeInCitations = [
          ...new Set(state.fieldsToIncludeInCitations.concat(action.payload)),
        ];
      })
);
