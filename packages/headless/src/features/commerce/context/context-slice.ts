import {createReducer} from '@reduxjs/toolkit';
import {setContext, setView} from './context-actions.js';
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
      });
  }
);
