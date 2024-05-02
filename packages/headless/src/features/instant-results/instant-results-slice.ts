import {createReducer} from '@reduxjs/toolkit';
import {
  clearExpiredItems,
  fetchItemsFulfilled,
  fetchItemsPending,
  fetchItemsRejected,
  registerInstantItem,
  updateInstantItemQuery,
} from '../instant-items/instant-items-slice';
import {fetchInstantResults} from '../search/search-actions';
import {
  clearExpiredResults,
  registerInstantResults,
  updateInstantResultsQuery,
} from './instant-results-actions';
import {getInstantResultsInitialState} from './instant-results-state';

export const instantResultsReducer = createReducer(
  getInstantResultsInitialState(),
  (builder) => {
    builder.addCase(registerInstantResults, (state, action) => {
      registerInstantItem(action.payload, state);
    });
    builder.addCase(updateInstantResultsQuery, (state, action) => {
      updateInstantItemQuery(action.payload, state);
    });
    builder.addCase(clearExpiredResults, (state, action) => {
      clearExpiredItems(action.payload, state);
    });
    builder.addCase(fetchInstantResults.pending, (state, action) => {
      fetchItemsPending(action.meta.arg, state, {results: []});
    });
    builder.addCase(fetchInstantResults.fulfilled, (state, action) => {
      const {results} = action.payload;
      fetchItemsFulfilled({...action.payload, ...action.meta.arg}, state, {
        results,
      });
    });
    builder.addCase(fetchInstantResults.rejected, (state, action) => {
      fetchItemsRejected(action.meta.arg, state);
    });
  }
);
