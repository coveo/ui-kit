import {createReducer} from '@reduxjs/toolkit';
import type {WritableDraft} from 'immer/dist/internal';
import {RETRYABLE_STREAM_ERROR_CODE} from '../../api/generated-answer/generated-answer-client';
import {executeSearch} from '../search/search-actions';
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
  registerAnswerStreamManager,
  notifyStreamAborted,
} from './generated-answer-actions';
import {
  GeneratedAnswerState,
  getGeneratedAnswerInitialState,
} from './generated-answer-state';

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
        return handleResetAnswer(state);
      })
      .addCase(executeSearch.fulfilled, (state, payload) => {
        const streamId =
          payload.payload.response.extendedResults
            .generativeQuestionAnsweringId;
        return state.currentStreamId === streamId
          ? state
          : {
              ...handleResetAnswer(state),
              shouldStartStream: !!streamId,
              currentStreamId: streamId,
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
      .addCase(registerAnswerStreamManager, (state) => {
        if (state.hasAnswerStreamManager) {
          throw new Error('Answer stream manager already registered');
        }
        state.hasAnswerStreamManager = true;
      })
      .addCase(notifyStreamAborted, (state) => {
        state.shouldAbortStream = false;
      })
);

function handleResetAnswer(state: WritableDraft<GeneratedAnswerState>) {
  return {
    ...getGeneratedAnswerInitialState(),
    responseFormat: state.responseFormat,
    fieldsToIncludeInCitations: state.fieldsToIncludeInCitations,
    isVisible: state.isVisible,
    shouldAbortStream: true,
  };
}
