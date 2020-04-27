import {combineReducers} from '@reduxjs/toolkit';
import {resultsReducer} from '../features/results/resultsSlice';
import {searchReducer} from '../features/search/searchSlice';
import {queryReducer} from '../features/query/querySlice';

export const rootReducer = combineReducers({
  search: searchReducer,
  results: resultsReducer,
  query: queryReducer,
});
