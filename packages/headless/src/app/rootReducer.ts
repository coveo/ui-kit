import {combineReducers} from 'redux';
import {resultsSlice} from '../features/results/resultsSlice';

export const rootReducer = combineReducers({
  results: resultsSlice,
});

export type RootState = ReturnType<typeof rootReducer>;
