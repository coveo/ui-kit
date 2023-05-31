import {createReducer} from '@reduxjs/toolkit';
import {change} from '../history/history-actions';
import {setContext, addContext, removeContext} from './context-actions';
import {getContextInitialState} from './context-state';

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
