import {createReducer} from '@reduxjs/toolkit';
import {executeSearch} from '../search/search-actions';
import {emptyCorrection, getDidYouMeanInitialState} from './did-you-mean-state';

export const didYouMeanReducer = createReducer(
  getDidYouMeanInitialState(),
  (builder) => {
    builder
      .addCase(executeSearch.pending, (state) => {
        state.queryCorrection = emptyCorrection();
        state.wasCorrectedTo = '';
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        const queryCorrection = action.payload.response?.queryCorrection;

        const nonOptionalQueryCorrection = {
          ...emptyCorrection(),
          ...queryCorrection,
          correctedQuery:
            queryCorrection?.correctedQuery ||
            queryCorrection?.corrections[0]?.correctedQuery ||
            '',
        };

        state.queryCorrection = nonOptionalQueryCorrection;
        state.wasCorrectedTo = nonOptionalQueryCorrection.correctedQuery;
        state.originalQuery = action.payload.originalQuery;
      });
  }
);
