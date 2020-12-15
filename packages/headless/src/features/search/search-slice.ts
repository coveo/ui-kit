import {createReducer} from '@reduxjs/toolkit';
import {change} from '../history/history-actions';
import {executeSearch, fetchMoreResults} from './search-actions';
import {getSearchInitialState, SearchState} from './search-state';

type SearchAction = typeof executeSearch | typeof fetchMoreResults;

function handleRejectedSearch(
  state: SearchState,
  action: ReturnType<SearchAction['rejected']>
) {
  state.error = action.payload ? action.payload : null;
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

function handlePendingSearch(state: SearchState) {
  state.isLoading = true;
}

export const searchReducer = createReducer(
  getSearchInitialState(),
  (builder) => {
    builder.addCase(executeSearch.rejected, handleRejectedSearch);
    builder.addCase(fetchMoreResults.rejected, handleRejectedSearch);
    builder.addCase(executeSearch.fulfilled, (state, action) => {
      handleFulfilledSearch(state, action);
      state.results = action.payload.response.results;
      state.facetOrder = action.payload.response.facets.map(
        (facet) => facet.facetId
      );
    });
    builder.addCase(fetchMoreResults.fulfilled, (state, action) => {
      handleFulfilledSearch(state, action);
      state.results = [...state.results, ...action.payload.response.results];
    });
    builder.addCase(executeSearch.pending, handlePendingSearch);
    builder.addCase(fetchMoreResults.pending, handlePendingSearch);
    builder.addCase(change.fulfilled, (state, action) => {
      state.facetOrder = action.payload.facetOrder;
    });
  }
);
