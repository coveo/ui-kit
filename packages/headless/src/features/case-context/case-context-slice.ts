import {Reducer, createReducer} from '@reduxjs/toolkit';
import {setCaseContext, setCaseId, setCaseNumber} from './case-context-actions.js';
import {CaseContextState, getCaseContextInitialState} from './case-context-state.js';

export const caseContextReducer: Reducer<CaseContextState> = createReducer(
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
