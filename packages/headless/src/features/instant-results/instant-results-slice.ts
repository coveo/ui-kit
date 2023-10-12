import {createReducer} from '@reduxjs/toolkit';
import {fetchInstantResults} from '../search/search-actions.js';
import {
  clearExpiredResults,
  FetchInstantResultsActionCreatorPayload,
  registerInstantResults,
  updateInstantResultsQuery,
} from './instant-results-actions.js';
import {
  getInstantResultsInitialState,
  hasExpired,
  InstantResultCache,
  InstantResultsState,
} from './instant-results-state.js';

export const instantResultsReducer = createReducer(
  getInstantResultsInitialState(),
  (builder) => {
    builder.addCase(registerInstantResults, (state, action) => {
      const {id} = action.payload;
      if (state[id]) {
        return;
      }
      state[id] = {q: '', cache: {}};
    });
    builder.addCase(updateInstantResultsQuery, (state, action) => {
      const {q, id} = action.payload;
      if (!q) {
        return;
      }
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
      for (const id in state) {
        for (const query in state[id].cache) {
          state[id].cache[query].isActive = false;
        }
      }

      if (!getCached(state, action.meta)) {
        makeEmptyCache(state, action.meta);
        return;
      }

      const cached = getCached(state, action.meta);
      cached!.isLoading = true;
      cached!.isActive = true;
      cached!.error = null;
    });
    builder.addCase(fetchInstantResults.fulfilled, (state, action) => {
      const {results, searchUid, totalCountFiltered, duration} = action.payload;
      const {cacheTimeout} = action.meta.arg;
      const cached = getCached(state, action.meta);

      cached!.isActive = true;
      cached!.searchUid = searchUid;
      cached!.isLoading = false;
      cached!.error = null;
      cached!.results = results;
      cached!.expiresAt = cacheTimeout ? cacheTimeout + Date.now() : 0;
      cached!.totalCountFiltered = totalCountFiltered;
      cached!.duration = duration;
    });
    builder.addCase(fetchInstantResults.rejected, (state, action) => {
      const cached = getCached(state, action.meta);
      cached!.error = action.error || null;
      cached!.isLoading = false;
      cached!.isActive = false;
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
    isActive: true,
    searchUid: '',
    totalCountFiltered: 0,
    duration: 0,
  };
};

const getCached = (
  state: InstantResultsState,
  meta: {arg: FetchInstantResultsActionCreatorPayload}
): InstantResultCache | null => {
  const {q, id} = meta.arg;
  return state[id].cache[q] || null;
};
