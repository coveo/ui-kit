import {combineReducers} from 'redux';
import resultsSlice from '../features/results/resultsSlice';
import searchSlice from '../features/search/searchSlice';

export const rootReducer = combineReducers({
  search: searchSlice,
  results: resultsSlice,
});

export type RootState = ReturnType<typeof rootReducer>;
