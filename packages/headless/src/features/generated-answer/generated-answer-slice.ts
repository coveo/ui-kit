import {createReducer} from '@reduxjs/toolkit';
import {RETRYABLE_STREAM_ERROR_CODE} from '../../api/generated-answer/generated-answer-client';
import './generated-answer-actions';
import {
  resetAnswer,
  setIsLoading,
  updateCitations,
  updateError,
  updateMessage,
} from './generated-answer-actions';
import {getGeneratedAnswerInitialState} from './generated-answer-state';

export const generatedAnswerReducer = createReducer(
  getGeneratedAnswerInitialState(),
  (builder) =>
    builder
      .addCase(updateMessage, (state, {payload}) => {
        state.isLoading = false;
        if (!state.answer) {
          state.answer = '';
        }
        state.answer += payload.textDelta;
      })
      .addCase(updateCitations, (state, {payload}) => {
        state.citations = state.citations.concat(payload.citations);
      })
      .addCase(updateError, (state, {payload}) => {
        state.isLoading = false;
        state.error = {
          ...payload,
          isRetryable: payload.code === RETRYABLE_STREAM_ERROR_CODE,
        };
        state.citations = [];
        delete state.answer;
      })
      .addCase(resetAnswer, () => {
        return getGeneratedAnswerInitialState();
      })
      .addCase(setIsLoading, (state, {payload}) => {
        state.isLoading = payload;
      })
);
