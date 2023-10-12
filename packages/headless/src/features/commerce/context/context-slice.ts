import {Reducer, createReducer} from '@reduxjs/toolkit';
import {CommerceContextState, getContextInitialState} from './context-state.js';
import {setContext, setUser, setView} from './context-actions.js';

export const contextReducer: Reducer<CommerceContextState> = createReducer(
  getContextInitialState(),

  (builder) => {
    builder
      .addCase(setContext, (_, {payload}) => {
        return payload;
      })
      .addCase(setUser, (state, {payload}) => {
        state.user = payload;
      })
      .addCase(setView, (state, {payload}) => {
        state.view = payload;
      });
  }
);
