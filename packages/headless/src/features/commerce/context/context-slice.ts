import {createReducer} from '@reduxjs/toolkit';
import {getContextInitialState} from './context-state';
import {setContext, setUser, setView} from './context-actions';

export const contextReducer = createReducer(
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
