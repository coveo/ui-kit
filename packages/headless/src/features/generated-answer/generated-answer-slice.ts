import {createReducer} from '@reduxjs/toolkit';
import './generated-answer-actions';
import {
  resetAnswer,
  setIsLoading,
  streamComplete,
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
        payload.citations.forEach((citation) => {
          state.citations.push(citation);
        });
      })
      .addCase(updateError, (state, {payload}) => {
        state.isLoading = false;
        state.error = payload;
        state.citations = [];
        delete state.answer;
      })
      .addCase(streamComplete, (state) => {
        state.isLoading = false;
      })
      .addCase(resetAnswer, () => {
        return getGeneratedAnswerInitialState();
      })
      .addCase(setIsLoading, (state, {payload}) => {
        state.isLoading = payload;
      })
);
