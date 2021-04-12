import {createReducer} from '@reduxjs/toolkit';
import {fetchResultContent} from './result-preview-actions';
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
      });
  }
);
