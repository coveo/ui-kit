import {createReducer} from '@reduxjs/toolkit';
import {fetchInterface} from './insight-interface-actions.js';
import {getInsightInterfaceInitialState} from './insight-interface-state.js';

export const insightInterfaceReducer = createReducer(
  getInsightInterfaceInitialState(),
  (builder) => {
    builder
      .addCase(fetchInterface.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchInterface.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchInterface.fulfilled, (state, action) => {
        state.loading = false;
        state.error = undefined;

        const {searchHub: _searchHub, ...config} = action.payload.response;
        state.config = config;
      });
  }
);
