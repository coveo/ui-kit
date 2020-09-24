import {createReducer} from '@reduxjs/toolkit';
import {
  enableDidYouMean,
  disableDidYouMean,
  applyDidYouMeanCorrection,
} from './did-you-mean-actions';
import {executeSearch} from '../search/search-actions';
import {QueryCorrection} from '../../api/search/search/query-corrections';

export interface DidYouMeanState {
  enableDidYouMean: boolean;
  wasCorrectedTo: string;
  wasAutomaticallyCorrected: boolean;
  queryCorrection: QueryCorrection;
}

export const emptyCorrection = () => ({
  correctedQuery: '',
  wordCorrections: [],
});

export function getDidYouMeanInitialState(): DidYouMeanState {
  return {
    enableDidYouMean: false,
    wasCorrectedTo: '',
    wasAutomaticallyCorrected: false,
    queryCorrection: emptyCorrection(),
  };
}

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
        state.queryCorrection =
          action.payload.response.queryCorrections[0] || emptyCorrection();
        state.wasAutomaticallyCorrected = action.payload.automaticallyCorrected;
      })
      .addCase(applyDidYouMeanCorrection, (state, action) => {
        state.wasCorrectedTo = action.payload;
      });
  }
);
