import {combineReducers} from '@reduxjs/toolkit';
import {queryReducer} from '../features/query/query-slice';
import {configurationReducer} from '../features/configuration/configuration-slice';
import {redirectionReducer} from '../features/redirection/redirection-slice';
import {HeadlessState} from '../state';
import {querySuggestReducer} from '../features/query-suggest/query-suggest-slice';
import {querySetReducer} from '../features/query-set/query-set-slice';
import {searchReducer} from '../features/search/search-slice';
import {paginationReducer} from '../features/pagination/pagination-slice';
import {sortCriteriaReducer} from '../features/sort-criteria/sort-criteria-slice';

export const rootReducer = combineReducers<HeadlessState>({
  query: queryReducer,
  querySet: querySetReducer,
  configuration: configurationReducer,
  pagination: paginationReducer,
  redirection: redirectionReducer,
  querySuggest: querySuggestReducer,
  search: searchReducer,
  sortCriteria: sortCriteriaReducer,
});
