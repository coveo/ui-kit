import {createReducer} from '@reduxjs/toolkit';
import {RETRYABLE_STREAM_ERROR_CODE} from '../../api/generated-answer/generated-answer-client';
import {
  dislikeGeneratedAnswer,
  likeGeneratedAnswer,
  resetAnswer,
  setIsLoading,
  setIsStreaming,
  updateCitations,
  updateError,
  updateMessage,
  updateResponseFormat,
} from './generated-answer-actions';
import {getGeneratedAnswerInitialState} from './generated-answer-state';

export const generatedAnswerReducer = createReducer(
  getGeneratedAnswerInitialState(),
  (builder) =>
    builder
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
      .addCase(resetAnswer, () => {
        return getGeneratedAnswerInitialState();
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
);
