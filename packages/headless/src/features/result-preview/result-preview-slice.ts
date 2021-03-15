import {createReducer} from '@reduxjs/toolkit';
import {fetchResultContent} from './result-preview-actions';
import {getResultPreviewInitialState} from './result-preview-state';

export const resultPreviewReducer = createReducer(
  getResultPreviewInitialState(),
  (builder) => {
    builder.addCase(
      fetchResultContent.fulfilled,
      (_, action) => action.payload
    );
  }
);
