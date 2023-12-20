import {createReducer} from '@reduxjs/toolkit';
import {executeSearch} from '../search/search-actions';
import {
  enableDidYouMean,
  disableDidYouMean,
  applyDidYouMeanCorrection,
  enableAutomaticQueryCorrection,
  disableAutomaticQueryCorrection,
  setCorrectionMode,
} from './did-you-mean-actions';
import {
  CorrectionMode,
  emptyLegacyCorrection,
  emptyNextCorrection,
  getDidYouMeanInitialState,
} from './did-you-mean-state';

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
          const nonOptionalQueryCorrections =
            queryCorrections && queryCorrections[0]
              ? queryCorrections[0]
              : emptyLegacyCorrection();

          state.queryCorrection = nonOptionalQueryCorrections;
        }

        if (state.queryCorrectionMode === 'next') {
          const nonOptionalQueryCorrection = {
            ...emptyNextCorrection(),
            ...queryCorrection,
            ...{
              correctedQuery:
                queryCorrection?.correctedQuery ||
                queryCorrection?.corrections[0]?.correctedQuery ||
                '',
            },
          };

          state.queryCorrection = nonOptionalQueryCorrection;
          state.wasCorrectedTo = nonOptionalQueryCorrection.correctedQuery;
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
