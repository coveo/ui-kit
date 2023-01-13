import {createReducer} from '@reduxjs/toolkit';
import type {Result} from '../../api/search/search/result';
import {executeSearch} from '../insight-search/insight-search-actions';
import {fetchMoreResults} from '../search/search-actions';
import {
  fetchResultContent,
  nextPreview,
  preparePreviewPagination,
  previousPreview,
  updateContentURL,
} from './result-preview-actions';
import {getResultPreviewInitialState} from './result-preview-state';

const getUniqueIdsOfResultsWithHTMLVersion = (results: Result[]) =>
  results.filter((r) => r.uniqueId).map((r) => r.uniqueId);

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
        state.resultsWithPreview = getUniqueIdsOfResultsWithHTMLVersion(
          action.payload.response.results
        );
      })
      .addCase(fetchMoreResults.fulfilled, (state, action) => {
        state.resultsWithPreview = state.resultsWithPreview.concat(
          getUniqueIdsOfResultsWithHTMLVersion(action.payload.response.results)
        );
      })
      .addCase(preparePreviewPagination, (state, action) => {
        state.resultsWithPreview = getUniqueIdsOfResultsWithHTMLVersion(
          action.payload.results
        );
      })
      .addCase(nextPreview, (state) => {
        let newPos = state.position + 1;
        if (newPos > state.resultsWithPreview.length - 1) {
          newPos = 0;
        }
        state.position = newPos;
      })
      .addCase(previousPreview, (state) => {
        let newPos = state.position - 1;
        if (newPos < 0) {
          newPos = state.resultsWithPreview.length - 1;
        }
        state.position = newPos;
      })
      .addCase(updateContentURL.fulfilled, (state, action) => {
        const {contentURL} = action.payload;

        state.contentURL = contentURL;
      });
  }
);
