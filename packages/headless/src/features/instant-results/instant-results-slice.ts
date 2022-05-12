import {createReducer} from '@reduxjs/toolkit';

import {
  fetchInstantResults,
  FetchInstantResultsActionCreatorPayload,
  registerInstantResults,
  updateInstantResultsQuery,
} from './instant-results-actions';
import {
  getInstantResultsInitialState,
  InstantResultCache,
  InstantResultsState,
} from './instant-results-state';

export const instantResultsReducer = createReducer(
  getInstantResultsInitialState(),
  (builder) => {
    builder.addCase(registerInstantResults, (state, action) => {
      const {id} = action.payload;
      state[id] = {q: '', cache: {}};
    });
    builder.addCase(updateInstantResultsQuery, (state, action) => {
      const {q, id} = action.payload;
      if (!q) return;
      state[id].q = q;
    });
    builder.addCase(fetchInstantResults.pending, (state, action) => {
      if (!getCached(state, action.meta)) {
        makeEmptyCache(state, action.meta);
      } else {
        getCached(state, action.meta)!.isLoading = true;
      }
    });
    builder.addCase(fetchInstantResults.fulfilled, (state, action) => {
      const {results} = action.payload;
      getCached(state, action.meta)!.isLoading = false;
      getCached(state, action.meta)!.results = results;
    });
    builder.addCase(fetchInstantResults.rejected, (state, action) => {
      getCached(state, action.meta)!.error = action.error || null;
    });
  }
);

const makeEmptyCache = (
  state: InstantResultsState,

  meta: {arg: FetchInstantResultsActionCreatorPayload}
) => {
  const {q, id} = meta.arg;
  state[id].cache[q] = {
    isLoading: true,
    error: null,
    results: [],
  };
};

const getCached = (
  state: InstantResultsState,
  meta: {arg: FetchInstantResultsActionCreatorPayload}
): InstantResultCache | null => {
  const {q, id} = meta.arg;
  return state[id].cache[q];
};
