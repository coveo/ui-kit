import {createReducer} from '@reduxjs/toolkit';
import './generated-answer-actions';
import {
  resetAnswer,
  setIsLoading,
  sseComplete,
  sseError,
  sseMessage,
} from './generated-answer-actions';
import {getGeneratedAnswerInitialState} from './generated-answer-state';

export const generatedAnswerReducer = createReducer(
  getGeneratedAnswerInitialState(),
  (builder) =>
    builder
      .addCase(sseMessage, (state, {payload}) => {
        state.isLoading = false;
        state.answer += payload;
        state.retryCount = 0;
      })
      .addCase(sseError, (state) => {
        state.isLoading = false;
        delete state.answer;
        state.retryCount++;
      })
      .addCase(sseComplete, (state) => {
        state.isLoading = false;
        state.retryCount = 0;
      })
      .addCase(resetAnswer, () => {
        return getGeneratedAnswerInitialState();
      })
      .addCase(setIsLoading, (state, {payload}) => {
        state.isLoading = payload;
      })
);
