import {createReducer} from '@reduxjs/toolkit';
import {analyticsDescription} from './analytics-actions';
import {getAnalyticsInitialState} from './analytics-state';

export const analyticsReducer = createReducer(
  getAnalyticsInitialState(),

  (builder) => {
    builder.addCase(analyticsDescription, (state, action) => {
      state.actionCause = action.payload.actionCause;
      state.customData = action.payload.customData || {};
    });
  }
);
