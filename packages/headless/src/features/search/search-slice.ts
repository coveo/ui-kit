import {createReducer, type PayloadAction} from '@reduxjs/toolkit';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {setError} from '../error/error-actions.js';
import {
  executeSearch,
  fetchFacetValues,
  fetchMoreResults,
  fetchPage,
  type TransitiveSearchAction,
  updateSearchAction,
} from './search-actions.js';
import {
  emptyQuestionAnswer,
  getSearchInitialState,
  type SearchState,
} from './search-state.js';

type SearchAction = typeof executeSearch | typeof fetchMoreResults;

function handleRejectedSearch(
  state: SearchState,
  action: ReturnType<SearchAction['rejected']>
) {
  const error = action.payload ?? null;
  if (error) {
    state.response = getSearchInitialState().response;
    state.results = [];
    state.questionAnswer = emptyQuestionAnswer();
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

function handleFulfilledNewSearch(
  state: SearchState,
  action: ReturnType<SearchAction['fulfilled']>
) {
  handleFulfilledSearch(state, action);
  state.results = action.payload.response.results.map((result) => ({
    ...result,
    searchUid: action.payload.response.searchUid,
  }));
  state.searchResponseId = action.payload.response.searchUid;
  state.questionAnswer = action.payload.response.questionAnswer;
  state.extendedResults = action.payload.response.extendedResults;
}

function handlePendingSearch(
  state: SearchState,
  action: PayloadAction<
    void,
    string,
    {
      requestId: string;
      arg: TransitiveSearchAction;
    }
  >
) {
  state.isLoading = true;
  state.searchAction = action.meta.arg.next;
  state.requestId = action.meta.requestId;
}

function handlePendingFetchMoreResults(
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
  state.searchAction = {actionCause: SearchPageEvents.browseResults};
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
    builder.addCase(fetchPage.rejected, (state, action) =>
      handleRejectedSearch(state, action)
    );
    builder.addCase(executeSearch.fulfilled, (state, action) => {
      handleFulfilledNewSearch(state, action);
    });
    builder.addCase(fetchMoreResults.fulfilled, (state, action) => {
      handleFulfilledSearch(state, action);
      state.results = [
        ...state.results,
        ...action.payload.response.results.map((result) => ({
          ...result,
          searchUid: action.payload.response.searchUid,
        })),
      ];
    });
    builder.addCase(fetchPage.fulfilled, (state, action) => {
      handleFulfilledSearch(state, action);
      state.results = [
        ...action.payload.response.results.map((result) => ({
          ...result,
          searchUid: action.payload.response.searchUid,
        })),
      ];
    });
    builder.addCase(fetchFacetValues.fulfilled, (state, action) => {
      state.response.facets = action.payload.response.facets;
      state.response.searchUid = action.payload.response.searchUid;
    });
    builder.addCase(executeSearch.pending, handlePendingSearch);
    builder.addCase(fetchMoreResults.pending, handlePendingFetchMoreResults);
    builder.addCase(fetchPage.pending, handlePendingSearch);
    builder.addCase(updateSearchAction, (state, action) => {
      state.searchAction = action.payload;
    });
    builder.addCase(setError, (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    });
  }
);
