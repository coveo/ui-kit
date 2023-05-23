import {createReducer} from '@reduxjs/toolkit';
import './generated-answer-actions';
import {
  resetAnswer,
  sseComplete,
  sseError,
  sseReceived,
} from './generated-answer-actions';
import {getGeneratedAnswerInitialState} from './generated-answer-state';

export const generatedAnswerReducer = createReducer(
  getGeneratedAnswerInitialState(),
  (builder) =>
    builder
      .addCase(sseReceived, (state, {payload}) => {
        state.isLoading = false;
        state.answer += payload;
        state.retryCount = 0;
        state.timeout?.refresh();
      })
      .addCase(sseError, (state) => {
        clearTimeout(state.timeout);
        delete state.timeout;
        state.retryCount++;
      })
      .addCase(sseComplete, (state) => {
        clearTimeout(state.timeout);
        delete state.timeout;
        state.retryCount = 0;
      })
      .addCase(resetAnswer, () => {
        return getGeneratedAnswerInitialState();
      })
);
