import {createReducer} from '@reduxjs/toolkit';
import {updateCaseInput} from './case-input-actions.js';
import {getCaseInputInitialState} from './case-input-state.js';

export const caseInputReducer = createReducer(
  getCaseInputInitialState(),

  (builder) => {
    builder.addCase(updateCaseInput, (state, action) => {
      state[action.payload.fieldName] = {
        value: action.payload.fieldValue,
      };
    });
  }
);
