import {createReducer} from '@reduxjs/toolkit';
import {setToNonEmptyQueryCorrection} from '../../did-you-mean/did-you-mean-slice-functions';
import {emptyNextCorrection} from '../../did-you-mean/did-you-mean-state';
import {executeSearch} from '../search/search-actions';
import {getDidYouMeanInitialState} from './did-you-mean-state';

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

        setToNonEmptyQueryCorrection(state, queryCorrection);
        state.originalQuery = action.payload.originalQuery;
      });
  }
);
