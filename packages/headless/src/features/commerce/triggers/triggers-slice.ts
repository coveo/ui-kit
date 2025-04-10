import {createReducer} from '@reduxjs/toolkit';
import {
  handleApplyQueryTriggerModification,
  handleFetchItemsFulfilled,
  handleFetchItemsPending,
  handleUpdateIgnoreQueryTrigger,
} from '../../triggers/triggers-slice-functions.js';
import {getTriggerInitialState} from '../../triggers/triggers-state.js';
import {fetchProductListing} from '../product-listing/product-listing-actions.js';
import {executeSearch} from '../search/search-actions.js';
import {
  applyQueryTriggerModification,
  updateIgnoreQueryTrigger,
} from './triggers-actions.js';

export const commerceTriggersReducer = createReducer(
  getTriggerInitialState(),
  (builder) =>
    builder
      .addCase(executeSearch.pending, handleFetchItemsPending)
      .addCase(executeSearch.fulfilled, (state, action) =>
        handleFetchItemsFulfilled(state, action.payload.response.triggers)
      )
      .addCase(fetchProductListing.pending, handleFetchItemsPending)
      .addCase(fetchProductListing.fulfilled, (state, action) =>
        handleFetchItemsFulfilled(state, action.payload.response.triggers)
      )
      .addCase(applyQueryTriggerModification, (state, action) =>
        handleApplyQueryTriggerModification(state, action.payload)
      )
      .addCase(updateIgnoreQueryTrigger, (state, action) =>
        handleUpdateIgnoreQueryTrigger(state, action.payload.q)
      )
);
