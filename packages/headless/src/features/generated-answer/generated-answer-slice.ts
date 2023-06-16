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
        if (!state.answer) {
          state.answer = '';
        }
        state.answer += payload;
      })
      .addCase(sseError, (state, {payload}) => {
        state.isLoading = false;
        state.error = payload;
        delete state.answer;
      })
      .addCase(sseComplete, (state) => {
        state.isLoading = false;
      })
      .addCase(resetAnswer, () => {
        return getGeneratedAnswerInitialState();
      })
      .addCase(setIsLoading, (state, {payload}) => {
        state.isLoading = payload;
      })
);
