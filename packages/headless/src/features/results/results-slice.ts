import {launchSearch} from '../search/search-slice';
import {createReducer} from '@reduxjs/toolkit';
import {SearchResult} from '../../api/search/search';

export interface ResultsState {
  results: SearchResult[];
  firstResult: number;
  numberOfResults: number;
}

export const getResultsInitialState: () => ResultsState = () => ({
  results: [],
  firstResult: 0,
  numberOfResults: 10,
});

export const resultsReducer = createReducer(getResultsInitialState(), builder =>
  builder.addCase(launchSearch.fulfilled, (state, action) => {
    state.results = action.payload.results;
  })
);
