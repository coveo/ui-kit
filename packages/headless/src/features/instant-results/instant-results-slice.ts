import {createReducer} from '@reduxjs/toolkit';
import {fetchInstantResults} from '../search/search-actions';

import {
  clearExpiredResults,
  FetchInstantResultsActionCreatorPayload,
  registerInstantResults,
  updateInstantResultsQuery,
} from './instant-results-actions';
import {
  getInstantResultsInitialState,
  hasExpired,
  InstantResultCache,
  InstantResultsState,
} from './instant-results-state';

export const instantResultsReducer = createReducer(
  getInstantResultsInitialState(),
  (builder) => {
    builder.addCase(registerInstantResults, (state, action) => {
      const {id} = action.payload;
      if (state[id]) return;
      state[id] = {q: '', cache: {}};
    });
    builder.addCase(updateInstantResultsQuery, (state, action) => {
      const {q, id} = action.payload;
      if (!q) return;
      state[id].q = q;
    });
    builder.addCase(clearExpiredResults, (state, action) => {
      const {id} = action.payload;
      Object.entries(state[id].cache).forEach(([q, cached]) => {
        if (hasExpired(cached)) {
          delete state[id].cache[q];
        }
      });
    });
    builder.addCase(fetchInstantResults.pending, (state, action) => {
      if (!getCached(state, action.meta)) {
        makeEmptyCache(state, action.meta);
      } else {
        const cached = getCached(state, action.meta);
        cached!.isLoading = true;
        cached!.error = null;
      }
    });
    builder.addCase(fetchInstantResults.fulfilled, (state, action) => {
      const {results} = action.payload;
      const {cacheTimeout} = action.meta.arg;
      const cached = getCached(state, action.meta);
      cached!.isLoading = false;
      cached!.error = null;
      cached!.results = results;
      cached!.expiresAt = cacheTimeout ? cacheTimeout + Date.now() : 0;
    });
    builder.addCase(fetchInstantResults.rejected, (state, action) => {
      const cached = getCached(state, action.meta);
      cached!.error = action.error || null;
      cached!.isLoading = false;
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
    expiresAt: 0,
  };
};

const getCached = (
  state: InstantResultsState,
  meta: {arg: FetchInstantResultsActionCreatorPayload}
): InstantResultCache | null => {
  const {q, id} = meta.arg;
  return state[id].cache[q] || null;
};
