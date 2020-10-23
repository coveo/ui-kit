import {createReducer} from '@reduxjs/toolkit';
import {getFieldsInitialState} from './fields-state';
import {registerFieldsToInclude} from './fields-actions';

export const fieldsReducer = createReducer(getFieldsInitialState(), (builder) =>
  builder.addCase(registerFieldsToInclude, (state, action) => {
    state.fieldsToInclude = [
      ...new Set(state.fieldsToInclude.concat(action.payload)),
    ];
  })
);
