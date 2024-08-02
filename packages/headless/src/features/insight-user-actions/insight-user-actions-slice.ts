import {createReducer} from '@reduxjs/toolkit';
import {
  fetchUserActions,
  registerUserActions,
} from './insight-user-actions-actions';
import {preprocessActionsData} from './insight-user-actions-preprocessing';
import {getInsightUserActionsInitialState} from './insight-user-actions-state';

export const insightUserActionsReducer = createReducer(
  getInsightUserActionsInitialState(),
  (builder) => {
    builder
      .addCase(registerUserActions, (state, action) => {
        state.ticketCreationDate = action.payload.ticketCreationDate;
        if (action.payload.excludedCustomActions) {
          state.excludedCustomActions = action.payload.excludedCustomActions;
        }
      })
      .addCase(fetchUserActions.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchUserActions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserActions.fulfilled, (state, action) => {
        state.loading = false;
        state.error = undefined;
        state.timeline = preprocessActionsData(
          state,
          action.payload.response.value
        );
      });
  }
);
