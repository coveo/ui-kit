import {createReducer, PayloadAction} from '@reduxjs/toolkit';
import {
  executeSearch,
  fetchFacetValues,
  fetchMoreResults,
} from './search-actions';
import {getSearchInitialState, SearchState} from './search-state';

type SearchAction = typeof executeSearch | typeof fetchMoreResults;

function handleRejectedSearch(
  state: SearchState,
  action: ReturnType<SearchAction['rejected']>
) {
  const error = action.payload ?? null;
  if (error) {
    state.response = getSearchInitialState().response;
    state.results = [];
  }

  state.error = error;
  state.isLoading = false;
}

function handleFulfilledSearch(
  state: SearchState,
  action: ReturnType<SearchAction['fulfilled']>
) {
  state.error = null;
  state.response = action.payload.response;
  state.queryExecuted = action.payload.queryExecuted;
  state.duration = action.payload.duration;
  state.isLoading = false;
}

function handlePendingSearch(
  state: SearchState,
  action: PayloadAction<
    void,
    string,
    {
      requestId: string;
    }
  >
) {
  state.isLoading = true;
  state.requestId = action.meta.requestId;
}

export const searchReducer = createReducer(
  getSearchInitialState(),
  (builder) => {
    builder.addCase(executeSearch.rejected, (state, action) =>
      handleRejectedSearch(state, action)
    );
    builder.addCase(fetchMoreResults.rejected, (state, action) =>
      handleRejectedSearch(state, action)
    );
    builder.addCase(executeSearch.fulfilled, (state, action) => {
      handleFulfilledSearch(state, action);
      state.results = action.payload.response.results;
      state.searchResponseId = action.payload.response.searchUid;
    });
    builder.addCase(fetchMoreResults.fulfilled, (state, action) => {
      handleFulfilledSearch(state, action);
      state.results = [...state.results, ...action.payload.response.results];
    });
    builder.addCase(fetchFacetValues.fulfilled, (state, action) => {
      state.response.facets = action.payload.response.facets;
      state.response.searchUid = action.payload.response.searchUid;
    });
    builder.addCase(executeSearch.pending, handlePendingSearch);
    builder.addCase(fetchMoreResults.pending, handlePendingSearch);
  }
);
