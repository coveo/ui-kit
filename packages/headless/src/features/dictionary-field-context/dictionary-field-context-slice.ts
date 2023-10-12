import {createReducer} from '@reduxjs/toolkit';
import {change} from '../history/history-actions.js';
import {
  addContext,
  removeContext,
  setContext,
} from './dictionary-field-context-actions.js';
import {getDictionaryFieldContextInitialState} from './dictionary-field-context-state.js';

export const dictionaryFieldContextReducer = createReducer(
  getDictionaryFieldContextInitialState(),
  (builder) => {
    builder
      .addCase(setContext, (state, action) => {
        state.contextValues = action.payload;
      })
      .addCase(addContext, (state, action) => {
        const {field, key} = action.payload;
        state.contextValues[field] = key;
      })
      .addCase(removeContext, (state, action) => {
        delete state.contextValues[action.payload];
      })
      .addCase(change.fulfilled, (state, action) => {
        if (!action.payload) {
          return;
        }

        state.contextValues =
          action.payload.dictionaryFieldContext.contextValues;
      });
  }
);
