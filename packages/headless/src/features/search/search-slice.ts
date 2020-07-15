import {createReducer} from '@reduxjs/toolkit';
import {SearchResponseSuccess} from '../../api/search/search/search-response';
import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';
import {executeSearch} from './search-actions';

export interface SearchState {
  /** The search response. For a full description, refer to {@link https://docs.coveo.com/en/13/cloud-v2-api-reference/search-api#operation/searchUsingPost}*/
  response: SearchResponseSuccess;
  duration: number;
  queryExecuted: string;
  error: SearchAPIErrorWithStatusCode | null;
  automaticallyCorrected: boolean;
}

export function getSearchInitialState(): SearchState {
  return {
    response: {
      results: [],
      searchUid: '',
      totalCountFiltered: 0,
      facets: [],
      queryCorrections: [],
    },
    duration: 0,
    queryExecuted: '',
    error: null,
    automaticallyCorrected: false,
  };
}

export const searchReducer = createReducer(
  getSearchInitialState(),
  (builder) => {
    builder.addCase(executeSearch.rejected, (state, action) => {
      state.error = action.payload ? action.payload : null;
    });
    builder.addCase(executeSearch.fulfilled, (state, action) => {
      state.error = null;
      state.response = action.payload.response;
      state.queryExecuted = action.payload.queryExecuted;
      state.duration = action.payload.duration;
    });
  }
);
