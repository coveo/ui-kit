import {createReducer} from '@reduxjs/toolkit';
import {
  setAttachedResults,
  attachResult,
  detachResult,
} from './attached-results-actions';
import {getAttachedResultsInitialState} from './attached-results-state';

export const attachToCaseReducer = createReducer(
  getAttachedResultsInitialState(),

  (builder) => {
    builder
      .addCase(setAttachedResults, (state, action) => {
        const {results: attachedResults, message} = action.payload;

        if ('attachedResults' in state && state['results']?.length > 0) {
          return;
        }

        state['results'] = attachedResults;
        state['message'] = message;
      })
      .addCase(attachResult, (state, action) => {
        state.results = [action.payload.result, ...state.results];
      })
      .addCase(detachResult, (state, action) => {
        state.results = state.results.filter(
          (result) => result.permanentId !== action.payload
        );
      });
  }
);
