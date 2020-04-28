import {launchSearch} from '../search/search-slice';
import {createReducer} from '@reduxjs/toolkit';
import {SearchResult} from '../../api/search/search';

export interface ResultsState {
  list: SearchResult[];
  firstResult: number;
  numberOfResults: number;
}

const initialState: ResultsState = {
  list: [],
  firstResult: 0,
  numberOfResults: 10,
};

export const resultsReducer = createReducer(initialState, builder =>
  builder.addCase(launchSearch.fulfilled, (state, action) => {
    state.list = action.payload.results;
  })
);
