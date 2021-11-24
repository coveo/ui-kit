import {createReducer} from '@reduxjs/toolkit';
import {setCaseInput} from './case-input-actions';
import {getCaseInputInitialState} from './case-input-state';

export const caseInputsReducer = createReducer(
  getCaseInputInitialState(),

  (builder) => {
    builder.addCase(setCaseInput, (state, action) => {
      state[action.payload.fieldName] = {
        value: action.payload.fieldValue,
      };
    });
  }
);
