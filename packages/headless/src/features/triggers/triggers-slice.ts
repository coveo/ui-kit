import {createReducer} from '@reduxjs/toolkit';
import {executeSearch} from '../search/search-actions.js';
import {
  applyQueryTriggerModification,
  updateIgnoreQueryTrigger,
} from './triggers-actions.js';
import {
  handleApplyQueryTriggerModification,
  handleFetchItemsFulfilled,
  handleFetchItemsPending,
  handleUpdateIgnoreQueryTrigger,
} from './triggers-slice-functions.js';
import {getTriggerInitialState} from './triggers-state.js';

export const triggerReducer = createReducer(
  getTriggerInitialState(),
  (builder) =>
    builder
      .addCase(executeSearch.pending, handleFetchItemsPending)
      .addCase(executeSearch.fulfilled, (state, action) =>
        handleFetchItemsFulfilled(state, action.payload.response.triggers)
      )
      .addCase(applyQueryTriggerModification, (state, action) =>
        handleApplyQueryTriggerModification(state, action.payload)
      )
      .addCase(updateIgnoreQueryTrigger, (state, action) =>
        handleUpdateIgnoreQueryTrigger(state, action.payload)
      )
);
