import {createReducer} from '@reduxjs/toolkit';
import {
  handleApplyQueryTriggerModification,
  handleFetchItemsFulfilled,
  handleFetchItemsPending,
  handleUpdateIgnoreQueryTrigger,
} from '../../triggers/triggers-slice-functions';
import {getTriggerInitialState} from '../../triggers/triggers-state';
import {executeSearch} from '../search/search-actions';
import {
  applyQueryTriggerModification,
  updateIgnoreQueryTrigger,
} from './triggers-actions';

export const commerceTriggersReducer = createReducer(
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
        handleUpdateIgnoreQueryTrigger(state, action.payload.q)
      )
);
