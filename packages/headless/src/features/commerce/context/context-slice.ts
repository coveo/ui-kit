import {createReducer} from '@reduxjs/toolkit';
import {setCapture, setContext, setUser, setView} from './context-actions';
import {getContextInitialState} from './context-state';

export const contextReducer = createReducer(
  getContextInitialState(),

  (builder) => {
    builder
      .addCase(setContext, (_, {payload}) => {
        return {
          capture: true,
          ...payload,
        };
      })
      .addCase(setUser, (state, {payload}) => {
        state.user = payload;
      })
      .addCase(setView, (state, {payload}) => {
        state.view = payload;
      })
      .addCase(setCapture, (state, {payload}) => {
        state.capture = payload;
      });
  }
);
