import {createReducer} from '@reduxjs/toolkit';
import {
  fetchUserActions,
  registerUserActions,
} from './insight-user-actions-actions';
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
      .addCase(fetchUserActions.fulfilled, (state, _action) => {
        state.loading = false;
        state.error = undefined;
        // TODO: SFINT-5639 Preprocess the user actions data returned from the API and set the state.
      });
  }
);
