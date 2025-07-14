import {createReducer} from '@reduxjs/toolkit';
import {executeSearch} from '../search/search-actions.js';
import {
  applyDidYouMeanCorrection,
  disableAutomaticQueryCorrection,
  disableDidYouMean,
  enableAutomaticQueryCorrection,
  enableDidYouMean,
  setCorrectionMode,
} from './did-you-mean-actions.js';
import {setToNonEmptyQueryCorrection} from './did-you-mean-slice-functions.js';
import {
  type CorrectionMode,
  emptyLegacyCorrection,
  getDidYouMeanInitialState,
} from './did-you-mean-state.js';

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
        state.queryCorrection = emptyLegacyCorrection();
        state.wasAutomaticallyCorrected = false;
        state.wasCorrectedTo = '';
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        const {queryCorrection, queryCorrections} = action.payload.response;

        if (state.queryCorrectionMode === 'legacy') {
          const nonOptionalQueryCorrections = queryCorrections?.[0]
            ? queryCorrections[0]
            : emptyLegacyCorrection();

          state.queryCorrection = nonOptionalQueryCorrections;
        }

        if (state.queryCorrectionMode === 'next') {
          setToNonEmptyQueryCorrection(state, queryCorrection);
        }

        state.wasAutomaticallyCorrected = action.payload.automaticallyCorrected;
        state.originalQuery = action.payload.originalQuery;
      })
      .addCase(applyDidYouMeanCorrection, (state, action) => {
        state.wasCorrectedTo = action.payload;
      })
      .addCase(setCorrectionMode, (state, action) => {
        state.queryCorrectionMode = action.payload as CorrectionMode;
      });
  }
);
