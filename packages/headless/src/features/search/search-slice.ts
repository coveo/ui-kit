import {createReducer} from '@reduxjs/toolkit';
import {isNullOrUndefined} from '@coveo/bueno';
import {SearchResponseSuccess} from '../../api/search/search/search-response';
import {executeSearch, fetchMoreResults} from './search-actions';
import {
  emptyQuestionAnswer,
  getSearchInitialState,
  SearchState,
} from './search-state';

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
  state.response = shimResponsePayload(action.payload.response);
  state.queryExecuted = action.payload.queryExecuted;
  state.duration = action.payload.duration;
  state.isLoading = false;
}

function handlePendingSearch(state: SearchState) {
  state.isLoading = true;
}

function shimResponsePayload(response: SearchResponseSuccess) {
  const empty = emptyQuestionAnswer();
  const copy = {...response};
  if (isNullOrUndefined(copy.questionAnswer)) {
    copy.questionAnswer = empty;
    return copy;
  }

  copy.questionAnswer = {...empty, ...copy.questionAnswer};
  return copy;
}

export const searchReducer = createReducer(
  getSearchInitialState(),
  (builder) => {
    builder.addCase(executeSearch.rejected, handleRejectedSearch);
    builder.addCase(fetchMoreResults.rejected, handleRejectedSearch);
    builder.addCase(executeSearch.fulfilled, (state, action) => {
      handleFulfilledSearch(state, action);
      state.results = action.payload.response.results;
    });
    builder.addCase(fetchMoreResults.fulfilled, (state, action) => {
      handleFulfilledSearch(state, action);
      state.results = [...state.results, ...action.payload.response.results];
    });
    builder.addCase(executeSearch.pending, handlePendingSearch);
    builder.addCase(fetchMoreResults.pending, handlePendingSearch);
  }
);
