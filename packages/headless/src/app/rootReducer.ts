import {combineReducers} from 'redux';
import {resultsSlice} from '../features/results/resultsSlice';
import {searchSlice} from '../features/search/searchSlice';
import {querySlice} from '../features/query/querySlice';

export const rootReducer = combineReducers({
  search: searchSlice,
  results: resultsSlice,
  query: querySlice,
});

export type RootState = ReturnType<typeof rootReducer>;
