import {createReducer} from '@reduxjs/toolkit';
import {setContext, setUser, setView} from './context-actions.js';
import {getContextInitialState} from './context-state.js';

export const contextReducer = createReducer(
  getContextInitialState(),

  (builder) => {
    builder
      .addCase(setContext, (_, {payload}) => {
        return payload;
      })
      .addCase(setView, (state, {payload}) => {
        state.view = payload;
      })
      .addCase(setUser, (state, {payload}) => {
        state.user = payload;
      });
  }
);
