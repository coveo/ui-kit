import {createReducer} from '@reduxjs/toolkit';
import {getDictionaryFieldContextInitialState} from './dictionary-field-context-state';

export const dictionaryFieldContextReducer = createReducer(
  getDictionaryFieldContextInitialState(),
  (builder) => {
    builder;
    // .addCase(setContext, (state, action) => {
    //   state.contextValues = action.payload;
    // })
    // .addCase(addContext, (state, action) => {
    //   state.contextValues[action.payload.contextKey] =
    //     action.payload.contextValue;
    // })
    // .addCase(removeContext, (state, action) => {
    //   delete state.contextValues[action.payload];
    // })
    // .addCase(change.fulfilled, (state, action) => {
    //   if (!action.payload) {
    //     return;
    //   }
    //   state.contextValues = action.payload.context.contextValues;
    // });
  }
);
