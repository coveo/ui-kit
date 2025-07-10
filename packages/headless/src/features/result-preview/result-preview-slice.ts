import {createReducer} from '@reduxjs/toolkit';
import type {Result} from '../../api/search/search/result.js';
import {
  executeSearch,
  fetchMoreResults,
  fetchPage,
} from '../search/search-actions.js';
import {
  fetchResultContent,
  nextPreview,
  preparePreviewPagination,
  previousPreview,
  updateContentURL,
} from './result-preview-actions.js';
import {
  getResultPreviewInitialState,
  type ResultPreviewState,
} from './result-preview-state.js';

const resetPreviewContentState = (state: ResultPreviewState) => {
  const {content, isLoading, uniqueId, contentURL} =
    getResultPreviewInitialState();
  state.content = content;
  state.isLoading = isLoading;
  state.uniqueId = uniqueId;
  state.contentURL = contentURL;
};

const getUniqueIdsOfResultsWithHTMLVersion = (
  results: Pick<Result, 'hasHtmlVersion' | 'uniqueId'>[]
) => results.filter((r) => r.hasHtmlVersion).map((r) => r.uniqueId);

export const resultPreviewReducer = createReducer(
  getResultPreviewInitialState(),
  (builder) => {
    builder
      .addCase(fetchResultContent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchResultContent.fulfilled, (state, action) => {
        const {content, uniqueId} = action.payload;

        state.position = state.resultsWithPreview.indexOf(uniqueId);
        state.content = content;
        state.uniqueId = uniqueId;
        state.isLoading = false;
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        resetPreviewContentState(state);
        state.resultsWithPreview = getUniqueIdsOfResultsWithHTMLVersion(
          action.payload.response.results
        );
      })
      .addCase(fetchMoreResults.fulfilled, (state, action) => {
        resetPreviewContentState(state);
        state.resultsWithPreview = state.resultsWithPreview.concat(
          getUniqueIdsOfResultsWithHTMLVersion(action.payload.response.results)
        );
      })
      .addCase(fetchPage.fulfilled, resetPreviewContentState)
      .addCase(preparePreviewPagination, (state, action) => {
        state.resultsWithPreview = getUniqueIdsOfResultsWithHTMLVersion(
          action.payload.results
        );
      })
      .addCase(nextPreview, (state) => {
        if (state.isLoading) {
          return;
        }
        let newPos = state.position + 1;
        if (newPos > state.resultsWithPreview.length - 1) {
          newPos = 0;
        }
        state.position = newPos;
      })
      .addCase(previousPreview, (state) => {
        if (state.isLoading) {
          return;
        }

        let newPos = state.position - 1;
        if (newPos < 0) {
          newPos = state.resultsWithPreview.length - 1;
        }
        state.position = newPos;
      })
      .addCase(updateContentURL.fulfilled, (state, action) => {
        state.contentURL = action.payload.contentURL;
      });
  }
);
