import {createReducer} from '@reduxjs/toolkit';
import {getCaseContextInitialState} from './case-context-state';
import {setCaseContext} from './case-context-actions';

export const caseContextReducer = createReducer(
  getCaseContextInitialState(),
  (builder) => {
    builder.addCase(setCaseContext, (state, action) => {
      state.caseContext = action.payload;
    });
  }
);
