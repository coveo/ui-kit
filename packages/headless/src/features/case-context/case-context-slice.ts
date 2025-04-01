import {createReducer} from '@reduxjs/toolkit';
import {
  setCaseContext,
  setCaseId,
  setCaseNumber,
} from './case-context-actions.js';
import {getCaseContextInitialState} from './case-context-state.js';

export const caseContextReducer = createReducer(
  getCaseContextInitialState(),
  (builder) => {
    builder
      .addCase(setCaseContext, (state, action) => {
        state.caseContext = action.payload;
      })
      .addCase(setCaseId, (state, action) => {
        state.caseId = action.payload;
      })
      .addCase(setCaseNumber, (state, action) => {
        state.caseNumber = action.payload;
      });
  }
);
