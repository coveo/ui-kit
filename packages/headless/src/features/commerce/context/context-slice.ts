import {createReducer} from '@reduxjs/toolkit';
import {getContextInitialState} from './context-state';
import {setClientId, setContext, setCurrency, setLanguage, setTrackingId, setUser, setView} from './context-actions';

export const contextReducer = createReducer(
  getContextInitialState(),

  (builder) => {
    builder
      .addCase(setContext, (state, {payload}) => {
        if (payload.trackingId) {
          state.trackingId = payload.trackingId;
        }
        if (payload.language) {
          state.language = payload.language;
        }
        if (payload.currency) {
          state.currency = payload.currency;
        }
        if (payload.clientId) {
          state.clientId = payload.clientId;
        }
        if (payload.user) {
          state.user = payload.user;
        }
        state.view = payload.view;
      })
      .addCase(setTrackingId, (state, {payload}) => {
        state.trackingId = payload;
      })
      .addCase(setLanguage, (state, {payload}) => {
        state.language = payload;
      })
      .addCase(setCurrency, (state, {payload}) => {
        state.currency = payload;
      })
      .addCase(setClientId, (state, {payload}) => {
        state.clientId = payload;
      })
      .addCase(setUser, (state, {payload}) => {
        state.user = payload;
      })
      .addCase(setView, (state, {payload}) => {
        state.view = payload;
      })
  }
);
