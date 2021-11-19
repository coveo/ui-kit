import {createReducer} from '@reduxjs/toolkit';
import {setCaseInput} from './case-inputs-actions';
import {getCaseInputsInitialState} from './case-inputs-state';

export const caseInputsReducer = createReducer(
  getCaseInputsInitialState(),

  (builder) => {
    builder.addCase(setCaseInput, (state, action) => {
      state[action.payload.fieldName] = {
        value: action.payload.fieldValue,
      };
    });
  }
);
