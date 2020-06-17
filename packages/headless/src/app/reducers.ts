import {ReducersMapObject} from '@reduxjs/toolkit';
import {HeadlessState} from '../state';
import {queryReducer} from '../features/query/query-slice';
import {configurationReducer} from '../features/configuration/configuration-slice';
import {redirectionReducer} from '../features/redirection/redirection-slice';
import {querySuggestReducer} from '../features/query-suggest/query-suggest-slice';
import {querySetReducer} from '../features/query-set/query-set-slice';
import {searchReducer} from '../features/search/search-slice';
import {paginationReducer} from '../features/pagination/pagination-slice';
import {sortCriteriaReducer} from '../features/sort-criteria/sort-criteria-slice';

export const allReducers: ReducersMapObject<HeadlessState> = {
  query: queryReducer,
  querySet: querySetReducer,
  configuration: configurationReducer,
  pagination: paginationReducer,
  redirection: redirectionReducer,
  querySuggest: querySuggestReducer,
  search: searchReducer,
  sortCriteria: sortCriteriaReducer,
};
