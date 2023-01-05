import {createReducer} from '@reduxjs/toolkit';
import {
  fetchUserActions,
  registerUserActions,
  incrementNumberOfSessionsBefore,
  incrementNumberOfSessionsAfter,
} from './insight-user-actions-actions';
import {getInsightUserActionsInitialState} from './insight-user-actions-state';

export const insightUserActionsReducer = createReducer(
  getInsightUserActionsInitialState(),
  (builder) => {
    builder
      .addCase(registerUserActions, (state, action) => {
        state.ticketCreationDate = action.payload.ticketCreationDate;
        if (action.payload.numberSessionsAfter) {
          state.numberSessionsAfter = action.payload.numberSessionsAfter;
        }
        if (action.payload.numberSessionsBefore) {
          state.numberSessionsBefore = action.payload.numberSessionsBefore;
        }
        if (action.payload.excludedCustomActions) {
          state.excludedCustomActions = action.payload.excludedCustomActions;
        }
      })
      .addCase(incrementNumberOfSessionsBefore, (state) => {
        state.numberSessionsBefore++;
      })
      .addCase(incrementNumberOfSessionsAfter, (state) => {
        state.numberSessionsAfter++;
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

        state.timeline = action.payload.response.timeline;
      });
  }
);
