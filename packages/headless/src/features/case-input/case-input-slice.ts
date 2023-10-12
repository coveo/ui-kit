import {Reducer, createReducer} from '@reduxjs/toolkit';
import {updateCaseInput} from './case-input-actions.js';
import {CaseInputState, getCaseInputInitialState} from './case-input-state.js';

export const caseInputReducer: Reducer<CaseInputState> = createReducer(
  getCaseInputInitialState(),

  (builder) => {
    builder.addCase(updateCaseInput, (state, action) => {
      state[action.payload.fieldName] = {
        value: action.payload.fieldValue,
      };
    });
  }
);
