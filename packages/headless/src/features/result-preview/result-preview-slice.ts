import {createReducer} from '@reduxjs/toolkit';
import {executeSearch} from '../search/search-actions';
import {fetchResultContent, updateContentURL} from './result-preview-actions';
import {getResultPreviewInitialState} from './result-preview-state';

export const resultPreviewReducer = createReducer(
  getResultPreviewInitialState(),
  (builder) => {
    builder
      .addCase(fetchResultContent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchResultContent.fulfilled, (state, action) => {
        const {content, uniqueId} = action.payload;

        state.content = content;
        state.uniqueId = uniqueId;
        state.isLoading = false;
      })
      .addCase(updateContentURL.fulfilled, (state, action) => {
        state.contentURL = action.payload.contentURL;
      })
      .addCase(executeSearch.fulfilled, (state) => {
        const {content, isLoading, uniqueId, contentURL} =
          getResultPreviewInitialState();
        state.content = content;
        state.isLoading = isLoading;
        state.uniqueId = uniqueId;
        state.contentURL = contentURL;
      });
  }
);
