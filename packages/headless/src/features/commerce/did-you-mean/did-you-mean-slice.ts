import {createReducer} from '@reduxjs/toolkit';
import {emptyNextCorrection} from '../../did-you-mean/did-you-mean-state.js';
import {executeSearch} from '../search/search-actions.js';
import {getDidYouMeanInitialState} from './did-you-mean-state.js';

export const didYouMeanReducer = createReducer(
  getDidYouMeanInitialState(),
  (builder) => {
    builder
      .addCase(executeSearch.pending, (state) => {
        state.queryCorrection = emptyNextCorrection();
        state.wasCorrectedTo = '';
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        const {queryCorrection} = action.payload.response;

        state.originalQuery = action.payload.originalQuery;
        state.wasCorrectedTo = queryCorrection?.correctedQuery ?? '';
        state.queryCorrection = {
          correctedQuery:
            queryCorrection?.correctedQuery ??
            queryCorrection?.corrections[0]?.correctedQuery ??
            '',
          wordCorrections:
            queryCorrection?.corrections[0]?.wordCorrections ?? [],
        };
      });
  }
);
