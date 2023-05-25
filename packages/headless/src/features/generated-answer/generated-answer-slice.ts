import {createReducer} from '@reduxjs/toolkit';
import {executeSearch} from '../search/search-actions';
import './generated-answer-actions';
import {
  resetAnswer,
  sseComplete,
  sseError,
  sseMessage,
} from './generated-answer-actions';
import {getGeneratedAnswerInitialState} from './generated-answer-state';

export const generatedAnswerReducer = createReducer(
  getGeneratedAnswerInitialState(),
  (builder) =>
    builder
      .addCase(executeSearch.fulfilled, (state, action) => {
        state.streamKey = action.payload.response.extendedResults.streamKey;
      })
      .addCase(sseMessage, (state, {payload}) => {
        state.isLoading = false;
        state.answer += payload;
        state.retryCount = 0;
      })
      .addCase(sseError, (state) => {
        state.isLoading = false;
        state.retryCount++;
      })
      .addCase(sseComplete, (state) => {
        state.isLoading = false;
        state.retryCount = 0;
      })
      .addCase(resetAnswer, () => {
        return getGeneratedAnswerInitialState();
      })
);
