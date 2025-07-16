import {createReducer} from '@reduxjs/toolkit';
import {change} from '../history/history-actions.js';
import {addContext, removeContext, setContext} from './context-actions.js';
import {getContextInitialState} from './context-state.js';

export const contextReducer = createReducer(
  getContextInitialState(),
  (builder) => {
    builder
      .addCase(setContext, (state, action) => {
        state.contextValues = action.payload;
      })
      .addCase(addContext, (state, action) => {
        state.contextValues[action.payload.contextKey] =
          action.payload.contextValue;
      })
      .addCase(removeContext, (state, action) => {
        delete state.contextValues[action.payload];
      })
      .addCase(change.fulfilled, (state, action) => {
        if (!action.payload) {
          return;
        }
        state.contextValues = action.payload.context.contextValues;
      });
  }
);
