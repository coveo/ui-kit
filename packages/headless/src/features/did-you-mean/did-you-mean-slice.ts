import {createReducer} from '@reduxjs/toolkit';
import {executeSearch} from '../search/search-actions';
import {
  enableDidYouMean,
  disableDidYouMean,
  applyDidYouMeanCorrection,
  enableAutomaticQueryCorrection,
  disableAutomaticQueryCorrection,
} from './did-you-mean-actions';
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
      .addCase(enableAutomaticQueryCorrection, (state) => {
        state.automaticallyCorrectQuery = true;
      })
      .addCase(disableAutomaticQueryCorrection, (state) => {
        state.automaticallyCorrectQuery = false;
      })
      .addCase(executeSearch.pending, (state) => {
        state.queryCorrection = emptyCorrection();
        state.wasAutomaticallyCorrected = false;
        state.wasCorrectedTo = '';
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        state.queryCorrection =
          action.payload.response.queryCorrections[0] || emptyCorrection();
        state.originalQuery = action.payload.originalQuery;
        state.wasAutomaticallyCorrected = action.payload.automaticallyCorrected;
      })
      .addCase(applyDidYouMeanCorrection, (state, action) => {
        state.wasCorrectedTo = action.payload;
      });
  }
);
