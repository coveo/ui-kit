import {createReducer} from '@reduxjs/toolkit';
import {fetchInterface} from './insight-interface-actions';
import {getInsightInterfaceInitialState} from './insight-interface-state';

export const insightInterfaceReducer = createReducer(
  getInsightInterfaceInitialState(),
  (builder) => {
    builder
      .addCase(fetchInterface.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInterface.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchInterface.fulfilled, (state, action) => {
        state.loading = false;
        state.error = undefined;
        state.config = {
          contextFields: action.payload.response.contextFields,
          interface: action.payload.response.interface,
        };
      });
  }
);
