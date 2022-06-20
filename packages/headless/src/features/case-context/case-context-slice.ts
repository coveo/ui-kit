import {createReducer} from '@reduxjs/toolkit';
import {getCaseContexttInitialState} from './case-context-state';
import {setCaseContext} from './case-context-actions';

export const caseContextReducer = createReducer(
  getCaseContexttInitialState(),
  (builder) => {
    builder.addCase(setCaseContext, (state, action) => {
      state.caseContext = action.payload;
    });
  }
);
