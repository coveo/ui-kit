import {combineReducers} from '@reduxjs/toolkit';
import {resultsReducer} from '../features/results/results-slice';
import {searchReducer} from '../features/search/search-slice';
import {queryReducer} from '../features/query/query-slice';

export const rootReducer = combineReducers({
  search: searchReducer,
  results: resultsReducer,
  query: queryReducer,
});
