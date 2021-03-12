import {createReducer} from '@reduxjs/toolkit';
import {fetchResultContent} from './quickview-actions';
import {getQuickviewInitialState} from './quickview-state';

export const quickviewReducer = createReducer(
  getQuickviewInitialState(),

  (builder) => {
    builder.addCase(fetchResultContent.fulfilled, (state, action) => {
      state.resultContent = action.payload;
    });
  }
);
