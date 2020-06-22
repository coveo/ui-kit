import {createReducer} from '@reduxjs/toolkit';
import {SearchResponse} from '../../api/search/search/search-response';
import {executeSearch} from './search-actions';

export interface SearchState {
  /** The search response. For a full description, refer to {@link https://docs.coveo.com/en/13/cloud-v2-api-reference/search-api#operation/searchUsingPost}*/
  response: SearchResponse;
  duration: number;
}

export function getSearchInitialState(): SearchState {
  return {
    response: {
      results: [],
      searchUid: '',
      totalCountFiltered: 0,
      facets: [],
    },
    duration: 0,
  };
}

export const searchReducer = createReducer(
  getSearchInitialState(),
  (builder) => {
    builder.addCase(executeSearch.fulfilled, (state, action) => {
      state.response = action.payload.response;
      state.duration = action.payload.duration;
    });
  }
);
