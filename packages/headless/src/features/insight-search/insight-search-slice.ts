import { createReducer, PayloadAction } from "@reduxjs/toolkit";
import { insightExecuteSearch, insightFetchMoreResults, insightFetchFacetValues } from "./insight-search-actions";
import { getInsightSearchInitialState, InsightSearchState } from "./insight-search-state";

type SearchAction = typeof insightExecuteSearch | typeof insightFetchMoreResults;

function handleRejectedSearch(
  state: InsightSearchState,
  action: ReturnType<SearchAction['rejected']>
) {
  const error = action.payload ?? null;
  if (error) {
    state.response = getInsightSearchInitialState().response;
    state.results = [];
  }

  state.error = error;
  state.isLoading = false;
}

function handleFulfilledSearch(
  state: InsightSearchState,
  action: ReturnType<SearchAction['fulfilled']>
) {
  state.error = null;
  state.response = action.payload.response;
  state.queryExecuted = action.payload.queryExecuted;
  state.duration = action.payload.duration;
  state.isLoading = false;
}

function handlePendingSearch(
    state: InsightSearchState,
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

export const insightSearchReducer = createReducer(getInsightSearchInitialState(), (builder) => {
    builder.addCase(insightExecuteSearch.rejected, (state, action) => {
        handleRejectedSearch(state, action)
    })
    .addCase(insightFetchMoreResults.rejected, (state, action) => {
        handleRejectedSearch(state, action)
    })
    .addCase(insightFetchFacetValues.rejected, (state, action) => {
        handleRejectedSearch(state, action)
    })
    .addCase(insightExecuteSearch.fulfilled, (state, action) => {
        handleFulfilledSearch(state, action);
        state.results = action.payload.response.results;
        state.searchResponseId = action.payload.response.searchUid;
    })
    .addCase(insightFetchMoreResults.fulfilled, (state, action) => {
        handleFulfilledSearch(state, action);
        state.results = [...state.results, ...action.payload.response.results];
    })
    .addCase(insightFetchFacetValues.fulfilled, (state, action) => {
        state.response.facets = action.payload.response.facets;
        state.response.searchUid = action.payload.response.searchUid;
    })
    .addCase(insightExecuteSearch.pending, handlePendingSearch)
    .addCase(insightFetchMoreResults.pending, handlePendingSearch)
    .addCase(insightFetchFacetValues.pending, handlePendingSearch)
})