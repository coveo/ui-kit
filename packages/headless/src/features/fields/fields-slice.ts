import {createReducer} from '@reduxjs/toolkit';
import {getFieldsInitialState} from './fields-state';
import {registerFieldsToInclude} from './fields-actions';
import {registerFolding} from '../folding/folding-actions';
import {getFoldingInitialState} from '../folding/folding-state';

export const fieldsReducer = createReducer(getFieldsInitialState(), (builder) =>
  builder
    .addCase(registerFieldsToInclude, (state, action) => {
      state.fieldsToInclude = [
        ...new Set(state.fieldsToInclude.concat(action.payload)),
      ];
    })
    .addCase(registerFolding, (state, {payload}) => {
      const defaultFields = getFoldingInitialState().fields;
      state.fieldsToInclude.push(
        payload.collectionField ?? defaultFields.collection,
        payload.parentField ?? defaultFields.parent,
        payload.childField ?? defaultFields.child
      );
    })
);
