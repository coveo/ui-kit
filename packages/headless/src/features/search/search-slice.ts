import {search, SearchRequest} from '../../api/search/search';
import {createReducer, createAsyncThunk} from '@reduxjs/toolkit';
import {RootState} from '@coveo/headless';

export enum SearchStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export interface SearchState {
  status: SearchStatus;
}

const initialState: SearchState = {
  status: SearchStatus.IDLE,
};

export const launchSearch = createAsyncThunk(
  'search/launch',
  async (_, {getState}) => {
    const state = getState() as RootState;

    const request: SearchRequest = {
      q: state.query.q,
      organizationId: 'searchuisamples',
      firstResult: state.results.firstResult,
      numberOfResults: state.results.numberOfResults,
    };

    return await search(request);
  }
);

export const searchReducer = createReducer(initialState, builder =>
  builder
    .addCase(launchSearch.pending, state => {
      state.status = SearchStatus.LOADING;
    })
    .addCase(launchSearch.fulfilled, state => {
      state.status = SearchStatus.SUCCESS;
    })
    .addCase(launchSearch.rejected, state => {
      state.status = SearchStatus.FAIL;
    })
);
