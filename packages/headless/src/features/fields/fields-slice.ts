import {createReducer} from '@reduxjs/toolkit';
import {registerFieldsToInclude} from './fields-actions';

export interface FieldsState {
  fieldsToInclude: string[];
}

export const getFieldsInitialState: () => FieldsState = () => ({
  fieldsToInclude: [
    'author',
    'language',
    'urihash',
    'objecttype',
    'collection',
    'source',
    'permanentid',
  ],
});

export const fieldsReducer = createReducer(getFieldsInitialState(), (builder) =>
  builder.addCase(registerFieldsToInclude, (state, action) => {
    state.fieldsToInclude = [
      ...new Set(state.fieldsToInclude.concat(action.payload)),
    ];
  })
);
