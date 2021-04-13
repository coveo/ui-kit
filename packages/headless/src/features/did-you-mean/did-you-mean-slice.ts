import {createReducer} from '@reduxjs/toolkit';
import {
  enableDidYouMean,
  disableDidYouMean,
  applyDidYouMeanCorrection,
  didYouMeanCorrectionReceived,
} from './did-you-mean-actions';
import {executeSearch} from '../search/search-actions';
import {emptyCorrection, getDidYouMeanInitialState} from './did-you-mean-state';

export const didYouMeanReducer = createReducer(
  getDidYouMeanInitialState(),
  (builder) => {
    builder
      .addCase(enableDidYouMean, (state) => {
        state.enableDidYouMean = true;
      })
      .addCase(disableDidYouMean, (state) => {
        state.enableDidYouMean = false;
      })
      .addCase(executeSearch.pending, (state) => {
        state.queryCorrection = emptyCorrection();
        state.wasAutomaticallyCorrected = false;
        state.wasCorrectedTo = '';
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        if (action.payload.response.queryCorrections[0]) {
          state.queryCorrection = action.payload.response.queryCorrections[0];
        } else {
          state.queryCorrection = emptyCorrection();
          state.originalQuery = '';
        }
        state.wasAutomaticallyCorrected = action.payload.automaticallyCorrected;
      })
      .addCase(applyDidYouMeanCorrection, (state, action) => {
        state.wasCorrectedTo = action.payload;
      })
      .addCase(didYouMeanCorrectionReceived, (state, action) => {
        state.originalQuery = action.payload;
      });
  }
);
