import {createReducer} from '@reduxjs/toolkit';
import {setContext, addContext, removeContext} from './context-actions';
import {change} from '../history/history-actions';

export type ContextValue = string | string[];
export type Context = Record<string, ContextValue>;

export type ContextState = {contextValues: Context};

export function getContextInitialState(): ContextState {
  return {
    contextValues: {},
  };
}

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
        state.contextValues = action.payload.context.contextValues;
      });
  }
);
