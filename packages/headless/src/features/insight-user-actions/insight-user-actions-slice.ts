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
      .addCase(fetchUserActions.fulfilled, (state, action) => {
        state.loading = false;
        state.error = undefined;

        console.log('state got--------------');
        console.log(action.payload.response.value);

        // state.timeline = action.payload.response;
      });
  }
);
