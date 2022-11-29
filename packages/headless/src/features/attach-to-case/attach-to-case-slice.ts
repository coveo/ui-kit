import {createReducer} from '@reduxjs/toolkit';
import {attachResult, detachResult} from './attach-to-case-actions';
import {getAttachedResultsInitialState} from './attach-to-case-state';

export const attachToCaseReducer = createReducer(
  getAttachedResultsInitialState(),

  (builder) => {
    builder
      .addCase(attachResult, (state, action) => {
        state.attachedResults = [
          action.payload.result,
          ...state.attachedResults,
        ];
      })
      .addCase(detachResult, (state, action) => {
        state.attachedResults = state.attachedResults.filter(
          (result) => result.permanentId !== action.payload
        );
      });
  }
);
