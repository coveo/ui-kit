import {createReducer} from '@reduxjs/toolkit';
import {fetchResultContent} from './result-preview-actions';
import {getResultPreviewInitialState} from './result-preview-state';

export const resultPreviewReducer = createReducer(
  getResultPreviewInitialState(),
  (builder) => {
    builder.addCase(fetchResultContent.fulfilled, (state, action) => {
      state.content = action.payload;
    });
  }
);
