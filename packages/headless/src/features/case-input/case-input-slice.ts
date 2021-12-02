import {createReducer} from '@reduxjs/toolkit';
import {updateCaseInput} from './case-input-actions';
import {getCaseInputInitialState} from './case-input-state';

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
