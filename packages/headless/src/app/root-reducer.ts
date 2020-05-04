import {combineReducers} from '@reduxjs/toolkit';
import {queryReducer} from '../features/query/query-slice';
import {configurationReducer} from '../features/configuration/configuration-slice';
import {redirectionReducer} from '../features/redirection/redirection-slice';
import {HeadlessState} from '@coveo/headless';

export const rootReducer = combineReducers<HeadlessState>({
  query: queryReducer,
  configuration: configurationReducer,
  redirection: redirectionReducer,
});
