import {createReducer} from '@reduxjs/toolkit';
import {ContextActions} from './context-actions';
import {change} from '../history/history-actions';
import {getContextInitialState} from './context-state';

export const contextReducer = createReducer(
  getContextInitialState(),
  (builder) => {
    builder
      .addCase(ContextActions.setContext, (state, action) => {
        state.contextValues = action.payload;
      })
      .addCase(ContextActions.addContext, (state, action) => {
        state.contextValues[action.payload.contextKey] =
          action.payload.contextValue;
      })
      .addCase(ContextActions.removeContext, (state, action) => {
        delete state.contextValues[action.payload];
      })
      .addCase(change.fulfilled, (state, action) => {
        state.contextValues = action.payload.context.contextValues;
      });
  }
);
