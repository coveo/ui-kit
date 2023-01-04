import {createReducer} from '@reduxjs/toolkit';
import {
  fetcUserActions,
  updateExcludedCustomActions,
  updateNumberOfSessionsAfter,
  updateNumberOfSessionsBefore,
  updateTicketCreationDate,
} from './insight-user-actions-actions';
import {getInsightUserActionsInitialState} from './insight-user-actions-state';

export const insightUserActionsReducer = createReducer(
  getInsightUserActionsInitialState(),
  (builder) => {
    builder
      .addCase(updateTicketCreationDate, (state, action) => {
        state.ticketCreationDate = action.payload;
      })
      .addCase(updateNumberOfSessionsBefore, (state, action) => {
        state.numberSessionsBefore = action.payload;
      })
      .addCase(updateNumberOfSessionsAfter, (state, action) => {
        state.numberSessionsAfter = action.payload;
      })
      .addCase(updateExcludedCustomActions, (state, action) => {
        state.excludedCustomActions = action.payload ?? [];
      })
      .addCase(fetcUserActions.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetcUserActions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetcUserActions.fulfilled, (state, action) => {
        state.loading = false;
        state.error = undefined;

        state.timeline = action.payload.response.timeline;
      });
  }
);
